import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/', requireAuth, requireRole('ADMIN', 'EDITOR', 'JOURNALIST'), async (_req, res) => {
  const [totalUsers, totalArticles, publishedArticles, pendingArticles, rejectedArticles, totalViews, totalComments, totalLikes] = await Promise.all([
    prisma.user.count(),
    prisma.article.count(),
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
    prisma.article.count({ where: { status: { in: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SCHEDULED'] } } }),
    prisma.article.count({ where: { status: 'REJECTED' } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }).then((result) => result._sum.viewCount ?? 0),
    prisma.comment.count(),
    prisma.like.count(),
  ]);

  const articlesByCategory = await prisma.category.findMany({
    include: { _count: { select: { articles: true } } },
  });

  return res.json({
    totals: { totalUsers, totalArticles, publishedArticles, pendingArticles, rejectedArticles, totalViews, totalComments, totalLikes },
    articlesByCategory,
  });
});

export default router;
