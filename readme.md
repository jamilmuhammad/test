# Insignia — Crypto Wallet Admin & Frontend

This repository contains a full-stack sample application: a NestJS backend (API, Prisma) and a React + Vite frontend (admin dashboard + chat UI).

This README documents how to run the project locally, the main API endpoints, and developer notes.

---

## Contents

- `backend/` — NestJS API server with Prisma. Implements auth, users, wallets, transactions.
- `frontend/` — React + Vite SPA. Includes login (Google + username/password), admin transactions dashboard, and user chat/detail page.

## Requirements

- Node.js 18+ (the project has been used with Node 22.x in development)
- pnpm (recommended) or npm/yarn
- PostgreSQL (local or container)
- Docker (optional — docker-compose provided for development)

## Quick start (recommended)

1. Start the database and backend using docker-compose (development):

```bash
cd backend
# copy .env if needed
cp .env.example .env
# start DB + backend (if your docker-compose config runs services)
docker compose -f docker-compose-development.yaml up --build
```

2. From another terminal, start the frontend:

```bash
cd frontend
pnpm install
pnpm run dev
```

3. Open the frontend (Vite) URL (usually `http://localhost:5173`).

## Backend (backend/)

Important scripts (from `backend/package.json`):

- `pnpm run start:dev` — start NestJS in watch mode
- `pnpm run prisma:generate` — generate Prisma client
- `pnpm run prisma:migrate` — run migrations (development)
- `pnpm run prisma:studio` — open Prisma Studio
- `pnpm run test` — run unit tests (Jest)

Environment variables

- See `backend/.env.example` — copy to `.env` and fill values.
- Important vars:
  - `DATABASE_URL` — Postgres connection string
  - `PORT` — backend port (default 3000)
  - `FRONTEND_ORIGIN` or `FRONTEND_ORIGINS` — allowed frontend origins for CORS (comma-separated)
  - `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` — token TTL values

CORS

The backend supports configurable CORS. Set `FRONTEND_ORIGIN` (single origin) or `FRONTEND_ORIGINS` (comma-separated). If not set the server will reflect the request origin (less strict).

API overview (important endpoints)

- Auth
  - `POST /v1/auth/login` — username/password login, returns `{ accessToken, refreshToken }` in body
  - `GET /v1/auth/me` — returns the current user's profile (requires bearer token)
  - `GET /v1/auth/google/url?redirect_uri=...` — generate Google OAuth URL
  - `POST /v1/auth/refresh` — refresh tokens (requires bearer)

- Users
  - `GET /v1/users/:id` — get user details (requires authentication)

- Wallets
  - `GET /v1/wallets/balance` — get the authenticated user's wallet balance
  - `POST /v1/wallets/deposit` — deposit to authenticated user's wallet
  - `POST /v1/wallets/transfer` — transfer between wallets (authenticated)

- Transactions
  - `GET /v1/transactions/user/:userId/top/:n` — top N transactions for a user (or use `userId=all` to fetch global top N)
  - `GET /v1/transactions/top-users/:n` — top transacting users
  - `GET /v1/transactions/users` — lightweight list of users for admin selection

Notes
- Many endpoints are protected by JWT and role guards (admin routes require SuperAdmin role).
- Some endpoints historically returned "soft" error objects in the body (e.g. `{ status: 401, message: 'Invalid credentials' }`). The frontend normalizes those responses.

## Frontend (frontend/)

Scripts (from `frontend/package.json`):

- `pnpm run dev` — start Vite dev server
- `pnpm run build` — build production bundle
- `pnpm run preview` — preview production build

Environment variables (Vite)

- `VITE_API_BASE` — base URL for the API (defaults to `http://localhost:8000/api/v1` in code if not set). You can set this in a `.env` file in `frontend/` or use `import.meta.env` when running.

Auth flows

- Google OAuth: frontend triggers `/v1/auth/google/url` to get a redirect URL.
- Username/password: the login form calls `/v1/auth/login` and then `/v1/auth/me` to fetch profile and role.

Pages and routes

- `/` — login page (username/password + Google). After login, users are redirected to `/chat` and admins to `/admin/transactions`.
- `/admin` — admin login (alternate route)
- `/auth/callback` — OAuth callback handler
- `/chat` — user detail / chat page (protected)
- `/admin/transactions` — admin transactions dashboard (role-protected)

Transactions dashboard

- Uses the endpoints:
  - `GET /v1/transactions/top-users/20` for chart data
  - `GET /v1/transactions/users` to populate the user selector
  - `GET /v1/transactions/user/:userId/top/200` to fetch transactions for selected user; use `userId=all` to fetch global top transactions

## Developer notes

- Auth token is stored in `localStorage` by the frontend under key `insignia.token` and user under `insignia.user`.
- The frontend `src/shared/api.ts` helper attaches Content-Type and Authorization headers. It also uses `credentials: 'include'` for cookie-based flows if needed.
- The frontend contains a small RoleProtectedRoute helper to deny access to admin routes for non-admin users.

## Demo images (frontend)

The frontend includes small demo avatar/logo images used by the UI for quick local demos. You can find them in the repository under `frontend/assets/demos`.

- Users (examples for the user-facing UI — login, detail, main):
  - Directory: https://github.com/jamilmuhammad/test (see `/frontend/assets/demos/users`)
  - Login Page: `/frontend/assets/demos/users/login_user.png`
  - Detail Page: `/frontend/assets/demos/users/detail_user.png`
  - Main Page: `/frontend/assets/demos/users/main_user.png`

- Admins (examples for admin UI — login, admin transaction, main):
  - Directory: https://github.com/jamilmuhammad/test (see `/frontend/assets/demos/admins`)
  - Login Page: `/frontend/assets/demos/users/login_admin.png`
  - Transactins Page: `/frontend/assets/demos/users/transaction_admin.png`
  - Main Page: `/frontend/assets/demos/users/main_admin.png`

- Icons (example for icon image):
    - Icon asset: `/assets/icons/image.png`
    - Use in components (Vite serves from `/assets/...`): `<img src="/assets/icons/image.png" alt="App icon" />`

Testing

- Backend: `pnpm --filter backend test` (or `cd backend && pnpm test`)
- Frontend: add tests as needed (no test suite included by default)

Troubleshooting

- Ensure `.env` in `backend/` has `DATABASE_URL` pointing to a running Postgres instance.
- If CORS issues occur, set `FRONTEND_ORIGIN` to your Vite origin (e.g. `http://localhost:5173`).
- If the frontend shows unexpected response shapes, open DevTools → Network and inspect the response body; the frontend normalizes common wrapper shapes but will log warnings for unusual shapes.

Contributing / Next steps

- Add server-side paginated transactions endpoint for large datasets.
- Improve frontend loading states and error UI.
- Move token storage to HTTP-only cookies for better security.

---

If you'd like, I can also:
- Add a `dev` Makefile or shell script to orchestrate both frontend and backend in one command.
- Add a Postman / OpenAPI collection for quick API testing.

