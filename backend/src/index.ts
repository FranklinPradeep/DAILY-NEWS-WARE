import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import categoryRoutes from './routes/categories.js';
import commentRoutes from './routes/comments.js';
import searchRoutes from './routes/search.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'News portal API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

app.listen(port, () => {
  console.log(`News portal API listening on http://localhost:${port}`);
});
