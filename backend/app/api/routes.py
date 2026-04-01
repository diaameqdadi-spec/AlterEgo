from fastapi import APIRouter, Header, HTTPException

from app.schemas import AvatarCreate, ChallengeRunRequest, LoginRequest, RegisterRequest
from app.services.challenges import (
    create_avatar,
    get_leaderboard,
    list_avatar_dicts,
    run_challenge,
)
from app.services.auth import (
    authenticate_user,
    create_access_token,
    register_user,
    verify_access_token,
)

router = APIRouter(prefix="/api/v1")


@router.post("/auth/register", status_code=201)
def register_route(payload: RegisterRequest) -> dict:
    try:
        user = register_user(
            email=payload.email,
            password=payload.password,
            display_name=payload.displayName,
        )
        token = create_access_token(user["id"])
        return {"token": token, "user": user}
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.post("/auth/login")
def login_route(payload: LoginRequest) -> dict:
    try:
        user = authenticate_user(email=payload.email, password=payload.password)
        token = create_access_token(user["id"])
        return {"token": token, "user": user}
    except ValueError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error


@router.get("/auth/me")
def me_route(authorization: str | None = Header(default=None)) -> dict:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token.")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        return verify_access_token(token)
    except ValueError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error


@router.get("/avatars")
def list_avatars() -> list[dict]:
    return list_avatar_dicts()


@router.post("/avatars", status_code=201)
def create_avatar_route(payload: AvatarCreate) -> dict:
    return create_avatar(payload)


@router.post("/challenges/run")
def run_challenge_route(payload: ChallengeRunRequest) -> dict:
    try:
        return run_challenge(
            avatar_id=payload.avatarId,
            question_id=payload.questionId,
        )
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get("/leaderboard")
def leaderboard_route() -> list[dict]:
    return get_leaderboard()
