# LegalAxis Lead Management System

This project upgrades the legal services website into a small SaaS-style lead management system.

## Folder structure

- `frontend/` - public website pages, styles, and browser JavaScript
- `backend/` - Express server, Prisma/PostgreSQL data access, middleware, and payment modules
- `api/` - Vercel Serverless Function entrypoint (routes to Express app)
- `backend/config/servicePricing.js` - service-based pricing used for order creation
- `backend/services/razorpayService.js` - Razorpay SDK wrapper and signature verification
- `prisma/` - PostgreSQL schema and migration history managed by Prisma
- `package.json` - Node.js dependencies and scripts
- `.env.example` - sample environment variables for admin login, sessions, and Razorpay

## Features

- Express backend with REST API
- PostgreSQL lead storage via Prisma
- Contact form connected to the backend
- Validation on both frontend and backend
- Simple anti-spam protection using a honeypot field and request rate limiting
- Admin login with session-based protection
- Lead search, service filter, date filter, and delete action
- Razorpay order creation for service-based payments
- Payment records stored in PostgreSQL via Prisma
- Payment signature verification before marking a payment as successful

## Windows setup

1. Install Node.js LTS from the official Node.js website if it is not already installed.
2. Open PowerShell in this project folder.
3. Run:
   `copy .env.example .env`
4. Open `.env` and change:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
5. Install packages:
   `npm.cmd install`
6. Start the app:
   `npm.cmd start`
7. Open your browser:
   - Website: `http://localhost:3000`
   - Admin: `http://localhost:3000/admin`

## Development commands

- Install dependencies: `npm.cmd install`
- Start production-style server: `npm.cmd start`
- Start with file watching in newer Node versions: `npm.cmd run dev`

## Deploy to Vercel

This repo can be deployed in two ways:

### Recommended (as discussed): Vercel frontend + Railway/Render backend

- Deploy **`frontend-next/`** to Vercel (Next.js)
- Deploy **`backend/`** to Railway/Render (Express)
- Use Supabase Postgres + Cloud storage for production scalability

### Steps

1. Push this project to GitHub.
2. **Deploy frontend on Vercel**
   - Import the repo
   - Set the **Root Directory** to `frontend-next`
   - Add env var: `NEXT_PUBLIC_API_BASE_URL=https://<your-backend-domain>`
3. **Deploy backend on Railway/Render**
   - Set env vars: `NODE_ENV=production`, `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - If using Redis: `REDIS_ENABLED=true`, `REDIS_URL`
   - Set `CORS_ALLOWED_ORIGINS` to your Vercel domain (comma-separated if multiple)
4. Confirm these load on the Vercel site:
   - `/`, `/services`, `/contact`
   - Form submission calls the backend via `NEXT_PUBLIC_API_BASE_URL`

### Notes (important)

- **Serverless filesystem is not persistent (Vercel)**. Don’t generate/store PDFs/uploads on Vercel. Use Supabase Storage or Cloudinary.
- **CORS**: backend must allow your Vercel origin via `CORS_ALLOWED_ORIGINS`.

### Alternative: all-in-one on Vercel (not recommended for scaling)

This repo also contains `vercel.json` + `api/index.js` that can run Express on Vercel.
It’s fine for demos, but not ideal for background jobs, webhooks, and file storage.

## Default admin behavior

The admin dashboard reads the username and password from `.env`. After login, the browser receives a session cookie and can access protected lead APIs.

## Payment API summary

- `POST /api/create-order` - create a Razorpay order for a selected service
- `POST /api/verify-payment` - verify Razorpay signature and mark a payment as paid

## Payment payload examples

### Create order request

```json
{
  "service": "GST Registration"
}
```

### Verify payment request

```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

