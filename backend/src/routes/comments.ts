import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const commentSchema = z.object({
  articleId: z.string().min(1),
  content: z.string().min(1),
  parentId: z.string().optional(),
});

router.get('/:articleId', async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: { articleId: req.params.articleId, parentId: null },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      children: { include: { user: { select: { id: true, name: true, avatar: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ comments });
});

router.post('/', requireAuth, async (req, res) => {
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid comment payload.' });
  }

  const comment = await prisma.comment.create({
    data: {
      articleId: parsed.data.articleId,
      userId: req.user!.id,
      content: parsed.data.content,
      parentId: parsed.data.parentId ?? null,
    },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  return res.status(201).json({ comment });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const commentId = String(req.params.id);
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return res.status(404).json({ message: 'Comment not found.' });

  if (comment.userId !== req.user!.id && !['ADMIN', 'EDITOR'].includes(req.user!.role)) {
    return res.status(403).json({ message: 'You cannot delete this comment.' });
  }

  await prisma.comment.delete({ where: { id: commentId } });

  return res.json({ message: 'Comment deleted.' });
});

export default router;
