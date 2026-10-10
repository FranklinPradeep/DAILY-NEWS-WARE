# News Portal Monorepo

A full-stack dynamic news publishing portal built with React, Vite, Express, Prisma, and SQLite for local development.

## Default admin
- Email: admin@newsportal.local
- Password: admin123

## Quick start

1. Install frontend dependencies:
   cd frontend && npm install
2. Install backend dependencies:
   cd backend && npm install
3. Generate Prisma client and push schema:
   cd backend && npx prisma generate && npx prisma db push && npm run db:seed
4. Run backend:
   cd backend && npm run dev
5. Run frontend:
   cd frontend && npm run dev

## App URLs
- Frontend: http://localhost:5173
- API: http://localhost:4000/api

## Production note
This local setup uses SQLite for development convenience. The Prisma schema is structured for a real PostgreSQL-ready deployment path.
