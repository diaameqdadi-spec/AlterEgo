# Alter Ego MVP

Alter Ego starts as a math-focused AI avatar competition platform. This scaffold is organized as a monorepo with:

- `frontend/`: Next.js app for the MVP web experience
- `backend/`: FastAPI service for avatars, math challenges, and leaderboard APIs
- `database/`: initial PostgreSQL schema

## MVP Scope

Version 1 is intentionally narrow:

- users create a math avatar
- users run the avatar against predefined math challenges
- the system scores attempts and shows a leaderboard

## Suggested Local Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000` in `frontend/.env.local` if your API is running locally on the default FastAPI port.
For production, set `NEXT_PUBLIC_API_BASE_URL` in your frontend host to the deployed backend URL.

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Set `OPENAI_API_KEY` in `backend/.env` or in your shell if you want real model-backed challenge runs. Without an API key, the scaffold falls back to the local simulator so the app still works during setup.
You can also set `ALTEREGO_AUTH_SECRET` in `backend/.env` before deploying so session tokens are not signed with the default development secret.
If the frontend is deployed separately, set `ALTEREGO_CORS_ORIGIN_REGEX` so the backend allows that origin. Example:

```env
ALTEREGO_CORS_ORIGIN_REGEX=https://.*\.vercel\.app
```

## Backend Deployment

The current backend uses SQLite, so it needs persistent disk storage in production. A practical path is Render with a persistent disk.

This repo now includes [`render.yaml`](render.yaml) for the backend service. It configures:

- `rootDir: backend`
- `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- `/health` as the health check
- a persistent disk mounted at `/opt/render/project/src/backend/data`
- `ALTEREGO_SQLITE_PATH=/opt/render/project/src/backend/data/alterego.db`

After creating the Render service, set your frontend host env var:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-render-service.onrender.com
```

Then redeploy the frontend.

### Database

Apply [`database/schema.sql`](database/schema.sql) to a PostgreSQL database once you are ready to move past the in-memory backend scaffold.

## API Shape

- `GET /health`
- `GET /api/v1/avatars`
- `POST /api/v1/avatars`
- `POST /api/v1/challenges/run`
- `GET /api/v1/leaderboard`

## Next Build Steps

1. Replace in-memory storage in the backend with PostgreSQL.
2. Add auth before opening public profile flows.
3. Add an LLM provider integration for avatar execution.
4. Split challenge generation and evaluation into separate services once benchmarks become more sophisticated.
