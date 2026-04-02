from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.config import get_cors_origin_regex
from app.services.auth import init_auth_db
from app.services.challenges import init_challenge_db

app = FastAPI(
    title="Alter Ego API",
    description="MVP backend for math-focused AI avatars",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=get_cors_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.on_event("startup")
def startup() -> None:
    init_auth_db()
    init_challenge_db()


app.include_router(router)
