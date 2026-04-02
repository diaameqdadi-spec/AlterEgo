from __future__ import annotations

from uuid import uuid4

from app.models import Avatar, Challenge
from app.schemas import AvatarCreate, LeaderboardEntry
from app.services.llm import generate_math_answer


CHALLENGES: dict[str, Challenge] = {
    "arith-001": Challenge(
        id="arith-001",
        prompt="What is 12 * 8?",
        expected_answer="96",
        challenge_type="arithmetic",
    ),
    "alg-001": Challenge(
        id="alg-001",
        prompt="Solve for x: 2x + 7 = 19",
        expected_answer="6",
        challenge_type="algebra",
    ),
    "word-001": Challenge(
        id="word-001",
        prompt=(
            "A bag has 3 red and 5 blue marbles. If you add 2 red marbles, "
            "how many red marbles are in the bag?"
        ),
        expected_answer="5",
        challenge_type="word_problem",
    ),
}


class AvatarRepository:
    def __init__(self) -> None:
        self._avatars: dict[str, Avatar] = {}

    def list(self) -> list[Avatar]:
        return sorted(
            self._avatars.values(),
            key=lambda avatar: (-avatar.total_score, avatar.name.lower()),
        )

    def create(self, payload: AvatarCreate) -> Avatar:
        avatar = Avatar(
            id=str(uuid4()),
            name=payload.name.strip(),
            persona=payload.persona.strip(),
            math_strategy=payload.mathStrategy.strip(),
            appearance_id=payload.appearanceId.strip(),
        )
        self._avatars[avatar.id] = avatar
        return avatar

    def get(self, avatar_id: str) -> Avatar | None:
        return self._avatars.get(avatar_id)


repository = AvatarRepository()


def list_avatar_dicts() -> list[dict]:
    avatars = repository.list()
    return [
        {
            "id": avatar.id,
            "name": avatar.name,
            "persona": avatar.persona,
            "mathStrategy": avatar.math_strategy,
            "appearanceId": avatar.appearance_id,
            "totalScore": avatar.total_score,
            "challengesAttempted": avatar.challenges_attempted,
        }
        for avatar in avatars
    ]


def create_avatar(payload: AvatarCreate) -> dict:
    avatar = repository.create(payload)
    return {
        "id": avatar.id,
        "name": avatar.name,
        "persona": avatar.persona,
        "mathStrategy": avatar.math_strategy,
        "appearanceId": avatar.appearance_id,
        "totalScore": avatar.total_score,
        "challengesAttempted": avatar.challenges_attempted,
    }


def run_challenge(avatar_id: str, question_id: str) -> dict:
    avatar = repository.get(avatar_id)
    if avatar is None:
        raise ValueError("Avatar not found")

    challenge = CHALLENGES.get(question_id)
    if challenge is None:
        raise ValueError("Challenge not found")

    submitted_answer = generate_math_answer(avatar, challenge)
    if submitted_answer is None:
        submitted_answer = simulate_avatar_answer(avatar, challenge)

    is_correct = submitted_answer == challenge.expected_answer

    avatar.challenges_attempted += 1
    if is_correct:
        avatar.total_score += 1

    return {
        "avatarId": avatar.id,
        "avatarName": avatar.name,
        "questionId": challenge.id,
        "submittedAnswer": submitted_answer,
        "expectedAnswer": challenge.expected_answer,
        "isCorrect": is_correct,
        "totalScore": avatar.total_score,
        "challengesAttempted": avatar.challenges_attempted,
        "challengeType": challenge.challenge_type,
    }


def get_leaderboard() -> list[dict]:
    rows = []
    for avatar in repository.list():
        accuracy = (
            round((avatar.total_score / avatar.challenges_attempted) * 100)
            if avatar.challenges_attempted
            else 0
        )
        rows.append(
            LeaderboardEntry(
                avatarId=avatar.id,
                avatarName=avatar.name,
                appearanceId=avatar.appearance_id,
                totalScore=avatar.total_score,
                challengesAttempted=avatar.challenges_attempted,
                accuracy=accuracy,
            ).model_dump()
        )
    return rows


def simulate_avatar_answer(avatar: Avatar, challenge: Challenge) -> str:
    """
    Placeholder scoring path until a real model provider is connected.
    The current scaffold rewards clearly math-focused prompts by default.
    """
    strategy = avatar.math_strategy.lower()
    if "double-check" in strategy or "careful" in strategy or "precise" in strategy:
        return challenge.expected_answer

    if challenge.id == "arith-001":
        return "94"

    if challenge.id == "alg-001":
        return "5"

    return "4"
