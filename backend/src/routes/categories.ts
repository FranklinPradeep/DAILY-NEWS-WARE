import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const schema = z.object({ name: z.string().min(2), description: z.string().optional() });

router.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return res.json({ categories });
});

router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid category payload.' });
  }

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.name.toLowerCase().replace(/\s+/g, '-'),
      description: parsed.data.description ?? `${parsed.data.name} coverage`,
    },
  });

  return res.status(201).json({ category });
});

export default router;
