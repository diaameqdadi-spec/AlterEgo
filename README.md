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

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Set `OPENAI_API_KEY` in `backend/.env` or in your shell if you want real model-backed challenge runs. Without an API key, the scaffold falls back to the local simulator so the app still works during setup.

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
