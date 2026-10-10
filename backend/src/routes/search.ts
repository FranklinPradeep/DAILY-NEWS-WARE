import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  const q = (req.query.q as string | undefined) ?? '';

  const articles = await prisma.article.findMany({
    where: q ? { OR: [{ title: { contains: q } }, { content: { contains: q } }, { excerpt: { contains: q } }] } : {},
    include: { author: true, category: true, tags: { include: { tag: true } } },
    take: 12,
    orderBy: { publishedAt: 'desc' },
  });

  return res.json({ articles, query: q });
});

router.get('/trending', async (_req, res) => {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    include: { author: true, category: true, tags: { include: { tag: true } } },
    orderBy: { viewCount: 'desc' },
    take: 10,
  });

  const trending = articles
    .map((article) => ({
      ...article,
      trendingScore: article.viewCount + article.likeCount * 3 + article.commentCount * 4 + article.shareCount * 5 + article.bookmarkCount * 3,
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore);

  return res.json({ trending });
});

export default router;
