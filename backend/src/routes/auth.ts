import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { comparePassword, hashPassword, signToken } from '../lib/auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid registration data.', errors: parsed.error.flatten() });
  }

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return res.status(409).json({ message: 'This email is already registered.' });
  }

  const readerRole = await prisma.role.findUnique({ where: { name: 'READER' } });
  if (!readerRole) {
    return res.status(500).json({ message: 'Role setup missing.' });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      roleId: readerRole.id,
      isEmailVerified: true,
    },
    include: { role: true },
  });

  return res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role.name },
    token: signToken({ id: user.id, email: user.email, role: user.role.name }),
  });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid login data.' });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });

  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role.name },
    token: signToken({ id: user.id, email: user.email, role: user.role.name }),
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { role: true } });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({ user: { id: user.id, name: user.name, email: user.email, bio: user.bio, avatar: user.avatar, role: user.role.name, createdAt: user.createdAt } });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: 'No account found for that email.' });
  }

  const token = Math.random().toString(36).slice(2);
  await prisma.user.update({ where: { id: user.id }, data: { resetToken: token, resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000) } });

  return res.json({ message: 'Password reset instructions prepared for development.', token });
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body as { token?: string; password?: string };

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required.' });
  }

  const user = await prisma.user.findFirst({ where: { resetToken: token } });
  if (!user) {
    return res.status(404).json({ message: 'Reset token is invalid.' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(password), resetToken: null, resetTokenExpiresAt: null },
  });

  return res.json({ message: 'Password updated successfully.' });
});

export default router;
