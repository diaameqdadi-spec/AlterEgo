from typing import Literal

from pydantic import BaseModel, Field


class AvatarCreate(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    persona: str = Field(min_length=10, max_length=400)
    mathStrategy: str = Field(min_length=10, max_length=800)
    appearanceId: str = Field(min_length=2, max_length=40)


class AvatarRead(BaseModel):
    id: str
    name: str
    persona: str
    mathStrategy: str
    appearanceId: str
    totalScore: int
    challengesAttempted: int


class ChallengeRunRequest(BaseModel):
    avatarId: str
    questionId: str


class ChallengeRunResult(BaseModel):
    avatarId: str
    avatarName: str
    questionId: str
    submittedAnswer: str
    expectedAnswer: str
    isCorrect: bool
    totalScore: int
    challengesAttempted: int
    challengeType: Literal["arithmetic", "algebra", "word_problem"]


class LeaderboardEntry(BaseModel):
    avatarId: str
    avatarName: str
    appearanceId: str | None = None
    totalScore: int
    challengesAttempted: int
    accuracy: int


class RegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=120)
    displayName: str = Field(min_length=2, max_length=60)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=8, max_length=128)


class UserRead(BaseModel):
    id: str
    email: str
    displayName: str
    createdAt: int


class AuthResponse(BaseModel):
    token: str
    user: UserRead
