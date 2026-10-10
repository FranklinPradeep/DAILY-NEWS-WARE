import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const articleSchema = z.object({
  title: z.string().min(3).optional(),
  subtitle: z.string().optional(),
  content: z.string().min(20).optional(),
  excerpt: z.string().optional(),
  categoryName: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SCHEDULED', 'PUBLISHED', 'RESUBMITTED']).optional(),
  isBreaking: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function serializeArticle(article: any) {
  return {
    ...article,
    tags: article.tags?.map((entry: any) => entry.tag?.name ?? entry.name ?? entry) ?? [],
    author: article.author ? { id: article.author.id, name: article.author.name, bio: article.author.bio, avatar: article.author.avatar } : null,
    category: article.category ? { id: article.category.id, name: article.category.name, slug: article.category.slug } : null,
  };
}

router.get('/', async (req, res) => {
  const q = (req.query.q as string | undefined) ?? '';
  const category = (req.query.category as string | undefined) ?? '';
  const status = (req.query.status as string | undefined) ?? 'PUBLISHED';

  const articles = await prisma.article.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(category ? { category: { is: { slug: category } } } : {}),
      ...(q ? { OR: [{ title: { contains: q } }, { content: { contains: q } }, { excerpt: { contains: q } }] } : {}),
    },
    include: {
      author: { select: { id: true, name: true, bio: true, avatar: true, role: { select: { name: true } } } },
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true, bookmarks: true, articleViews: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });

  return res.json({ articles: articles.map(serializeArticle) });
});

router.get('/:slug', async (req, res) => {
  const article = await prisma.article.findUnique({
    where: { slug: req.params.slug },
    include: {
      author: { select: { id: true, name: true, bio: true, avatar: true, role: { select: { name: true } } } },
      category: true,
      tags: { include: { tag: true } },
      comments: { include: { user: { select: { id: true, name: true, avatar: true } }, children: { include: { user: { select: { id: true, name: true, avatar: true } } } } }, orderBy: { createdAt: 'desc' } },
      likes: true,
      bookmarks: true,
    },
  });

  if (!article) {
    return res.status(404).json({ message: 'Article not found.' });
  }

  return res.json({ article: serializeArticle(article) });
});

router.post('/', requireAuth, requireRole('ADMIN', 'EDITOR', 'JOURNALIST'), async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({
    title: z.string().min(3),
    subtitle: z.string().optional(),
    content: z.string().min(20),
    excerpt: z.string().optional(),
    categoryName: z.string().optional(),
    featuredImage: z.string().optional(),
    status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SCHEDULED', 'PUBLISHED', 'RESUBMITTED']).optional(),
    isBreaking: z.boolean().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid article payload.', errors: parsed.error.flatten() });
  }

  const { title, subtitle, content, excerpt, categoryName, featuredImage, status, isBreaking, seoTitle, seoDescription } = parsed.data;
  const slug = slugify(title);

  let category = null;
  if (categoryName) {
    category = await prisma.category.upsert({
      where: { slug: slugify(categoryName) },
      update: { name: categoryName },
      create: { name: categoryName, slug: slugify(categoryName), description: `${categoryName} coverage` },
    });
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      subtitle,
      content,
      excerpt: excerpt ?? content.slice(0, 180),
      featuredImage,
      authorId: req.user!.id,
      categoryId: category?.id ?? null,
      status: status ?? 'DRAFT',
      isBreaking: isBreaking ?? false,
      seoTitle: seoTitle ?? title,
      seoDescription: seoDescription ?? excerpt ?? content.slice(0, 180),
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
    include: { author: true, category: true },
  });

  return res.status(201).json({ article: serializeArticle(article) });
});

router.put('/:id', requireAuth, requireRole('ADMIN', 'EDITOR', 'JOURNALIST'), async (req: AuthenticatedRequest, res) => {
  const articleId = String(req.params.id);
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return res.status(404).json({ message: 'Article not found.' });

  if (article.authorId !== req.user!.id && !['ADMIN', 'EDITOR'].includes(req.user!.role)) {
    return res.status(403).json({ message: 'You can only edit your own articles.' });
  }

  const payload = articleSchema.partial().safeParse(req.body);

  if (!payload.success) {
    return res.status(400).json({ message: 'Invalid article update payload.' });
  }

  const updated = await prisma.article.update({
    where: { id: articleId },
    data: {
      ...payload.data,
      slug: payload.data.title ? slugify(payload.data.title) : undefined,
      excerpt: payload.data.excerpt ?? article.excerpt,
      publishedAt: payload.data.status === 'PUBLISHED' ? new Date() : article.publishedAt,
      status: payload.data.status ?? article.status,
    },
    include: { author: true, category: true },
  });

  return res.json({ article: serializeArticle(updated) });
});

router.post('/:id/submit', requireAuth, requireRole('ADMIN', 'EDITOR', 'JOURNALIST'), async (req: AuthenticatedRequest, res) => {
  const articleId = String(req.params.id);
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return res.status(404).json({ message: 'Article not found.' });

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: { status: 'SUBMITTED' },
  });

  return res.json({ article: updated });
});

router.post('/:id/approve', requireAuth, requireRole('ADMIN', 'EDITOR'), async (req: AuthenticatedRequest, res) => {
  const articleId = String(req.params.id);
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return res.status(404).json({ message: 'Article not found.' });

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: { status: 'APPROVED', publishedAt: new Date() },
  });

  return res.json({ article: updated });
});

router.post('/:id/reject', requireAuth, requireRole('ADMIN', 'EDITOR'), async (req: AuthenticatedRequest, res) => {
  const articleId = String(req.params.id);
  const { reason } = req.body as { reason?: string };
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return res.status(404).json({ message: 'Article not found.' });

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: { status: 'REJECTED' },
  });

  await prisma.notification.create({
    data: {
      userId: article.authorId,
      type: 'ARTICLE_REJECTED',
      message: reason ? `Editor feedback: ${reason}` : 'Your article was rejected. Please revise and resubmit.',
      link: `/articles/${article.slug}`,
    },
  });

  return res.json({ article: updated, message: 'Article rejected.' });
});

router.post('/:id/publish', requireAuth, requireRole('ADMIN', 'EDITOR'), async (req: AuthenticatedRequest, res) => {
  const articleId = String(req.params.id);
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return res.status(404).json({ message: 'Article not found.' });

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  });

  return res.json({ article: updated });
});

router.post('/:id/like', requireAuth, async (req: AuthenticatedRequest, res) => {
  const articleId = String(req.params.id);
  const existing = await prisma.like.findUnique({ where: { articleId_userId: { articleId, userId: req.user!.id } } });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    await prisma.article.update({ where: { id: articleId }, data: { likeCount: { decrement: 1 } } });
    return res.json({ liked: false, message: 'Like removed.' });
  }

  await prisma.like.create({ data: { articleId, userId: req.user!.id } });
  await prisma.article.update({ where: { id: articleId }, data: { likeCount: { increment: 1 } } });

  return res.json({ liked: true, message: 'Article liked.' });
});

router.post('/:id/bookmark', requireAuth, async (req: AuthenticatedRequest, res) => {
  const articleId = String(req.params.id);
  const existing = await prisma.bookmark.findUnique({ where: { articleId_userId: { articleId, userId: req.user!.id } } });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    await prisma.article.update({ where: { id: articleId }, data: { bookmarkCount: { decrement: 1 } } });
    return res.json({ bookmarked: false, message: 'Bookmark removed.' });
  }

  await prisma.bookmark.create({ data: { articleId, userId: req.user!.id } });
  await prisma.article.update({ where: { id: articleId }, data: { bookmarkCount: { increment: 1 } } });

  return res.json({ bookmarked: true, message: 'Article bookmarked.' });
});

router.post('/:id/view', async (req: AuthenticatedRequest, res) => {
  const articleId = String(req.params.id);
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return res.status(404).json({ message: 'Article not found.' });

  await prisma.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } });
  await prisma.articleView.create({ data: { articleId: article.id, userId: req.user?.id ?? null } });

  return res.json({ message: 'View recorded.' });
});

export default router;
