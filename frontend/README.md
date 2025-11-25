# Insignia Frontend

React + Vite app (React Router v7, Tailwind with shadcn-style components) for the Insignia backend.

## Features
- Google Sign-In via backend OAuth endpoints
- JWT session stored locally
- Chat UI that calls `/api/v1/rag-chat/rag`
- Renders tabular results when `query_data` is returned

## Getting started

1. Install dependencies

```bash
cd frontend
npm install
```

2. Configure env (optional)

Create `.env` with:

```bash
VITE_API_BASE=http://localhost:8000/api/v1
```

3. Run

```bash
npm run dev
```

Open http://localhost:5173

## Auth callback configuration


## Notes
- If you prefer a pure "better-auth" server, you would normally run it alongside the SPA. Since the backend is FastAPI and already implements Google OAuth + JWT, the SPA integrates directly with those endpoints.
- Tailwind has been configured with a minimal design system; components live under `src/widgets/ui`.