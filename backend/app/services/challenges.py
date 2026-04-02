from __future__ import annotations

import sqlite3
import time
from pathlib import Path
from uuid import uuid4

from app.config import get_database_path
from app.models import Avatar, Challenge
from app.schemas import AvatarCreate, ChallengeAttemptRead, LeaderboardEntry
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


def _db_path() -> Path:
    return Path(get_database_path())


def init_challenge_db() -> None:
    path = _db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(path) as connection:
        connection.execute("pragma foreign_keys = on")
        connection.execute(
            """
            create table if not exists avatars (
                id text primary key,
                user_id text not null references users(id) on delete cascade,
                name text not null,
                persona text not null,
                math_strategy text not null,
                appearance_id text not null,
                total_score integer not null default 0,
                challenges_attempted integer not null default 0,
                created_at integer not null
            )
            """
        )
        connection.execute(
            """
            create table if not exists challenge_attempts (
                id text primary key,
                avatar_id text not null references avatars(id) on delete cascade,
                user_id text not null references users(id) on delete cascade,
                question_id text not null,
                challenge_type text not null,
                submitted_answer text not null,
                expected_answer text not null,
                is_correct integer not null,
                created_at integer not null
            )
            """
        )
        connection.execute(
            """
            create index if not exists idx_avatars_user_id
            on avatars (user_id)
            """
        )
        connection.execute(
            """
            create index if not exists idx_challenge_attempts_user_id
            on challenge_attempts (user_id)
            """
        )
        connection.execute(
            """
            create index if not exists idx_challenge_attempts_avatar_id
            on challenge_attempts (avatar_id)
            """
        )
        connection.commit()


def _connect() -> sqlite3.Connection:
    init_challenge_db()
    connection = sqlite3.connect(_db_path())
    connection.row_factory = sqlite3.Row
    connection.execute("pragma foreign_keys = on")
    return connection


def _row_to_avatar(row: sqlite3.Row) -> Avatar:
    return Avatar(
        id=row["id"],
        user_id=row["user_id"],
        name=row["name"],
        persona=row["persona"],
        math_strategy=row["math_strategy"],
        appearance_id=row["appearance_id"],
        total_score=row["total_score"],
        challenges_attempted=row["challenges_attempted"],
        created_at=row["created_at"],
    )


def list_avatar_dicts(user_id: str) -> list[dict]:
    with _connect() as connection:
        rows = connection.execute(
            """
            select id, user_id, name, persona, math_strategy, appearance_id,
                   total_score, challenges_attempted, created_at
            from avatars
            where user_id = ?
            order by total_score desc, name collate nocase asc
            """,
            (user_id,),
        ).fetchall()

    avatars = [_row_to_avatar(row) for row in rows]
    return [
        {
            "id": avatar.id,
            "name": avatar.name,
            "persona": avatar.persona,
            "mathStrategy": avatar.math_strategy,
            "appearanceId": avatar.appearance_id,
            "totalScore": avatar.total_score,
            "challengesAttempted": avatar.challenges_attempted,
            "createdAt": avatar.created_at,
        }
        for avatar in avatars
    ]


def create_avatar(user_id: str, payload: AvatarCreate) -> dict:
    avatar = Avatar(
        id=str(uuid4()),
        user_id=user_id,
        name=payload.name.strip(),
        persona=payload.persona.strip(),
        math_strategy=payload.mathStrategy.strip(),
        appearance_id=payload.appearanceId.strip(),
        created_at=int(time.time()),
    )
    with _connect() as connection:
        connection.execute(
            """
            insert into avatars (
                id, user_id, name, persona, math_strategy, appearance_id,
                total_score, challenges_attempted, created_at
            )
            values (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                avatar.id,
                avatar.user_id,
                avatar.name,
                avatar.persona,
                avatar.math_strategy,
                avatar.appearance_id,
                avatar.total_score,
                avatar.challenges_attempted,
                avatar.created_at,
            ),
        )
        connection.commit()

    return {
        "id": avatar.id,
        "name": avatar.name,
        "persona": avatar.persona,
        "mathStrategy": avatar.math_strategy,
        "appearanceId": avatar.appearance_id,
        "totalScore": avatar.total_score,
        "challengesAttempted": avatar.challenges_attempted,
        "createdAt": avatar.created_at,
    }


def run_challenge(user_id: str, avatar_id: str, question_id: str) -> dict:
    with _connect() as connection:
        row = connection.execute(
            """
            select id, user_id, name, persona, math_strategy, appearance_id,
                   total_score, challenges_attempted, created_at
            from avatars
            where id = ? and user_id = ?
            """,
            (avatar_id, user_id),
        ).fetchone()

        if row is None:
            raise ValueError("Avatar not found")

        avatar = _row_to_avatar(row)

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

        connection.execute(
            """
            update avatars
            set total_score = ?, challenges_attempted = ?
            where id = ?
            """,
            (avatar.total_score, avatar.challenges_attempted, avatar.id),
        )
        connection.execute(
            """
            insert into challenge_attempts (
                id, avatar_id, user_id, question_id, challenge_type,
                submitted_answer, expected_answer, is_correct, created_at
            )
            values (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                str(uuid4()),
                avatar.id,
                user_id,
                challenge.id,
                challenge.challenge_type,
                submitted_answer,
                challenge.expected_answer,
                int(is_correct),
                int(time.time()),
            ),
        )
        connection.commit()

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


def list_challenge_attempts(user_id: str) -> list[dict]:
    with _connect() as connection:
        rows = connection.execute(
            """
            select
                ca.id,
                ca.avatar_id,
                a.name as avatar_name,
                ca.question_id,
                ca.challenge_type,
                ca.submitted_answer,
                ca.expected_answer,
                ca.is_correct,
                ca.created_at
            from challenge_attempts ca
            join avatars a on a.id = ca.avatar_id
            where ca.user_id = ?
            order by ca.created_at desc
            """,
            (user_id,),
        ).fetchall()

    return [
        ChallengeAttemptRead(
            id=row["id"],
            avatarId=row["avatar_id"],
            avatarName=row["avatar_name"],
            questionId=row["question_id"],
            challengeType=row["challenge_type"],
            submittedAnswer=row["submitted_answer"],
            expectedAnswer=row["expected_answer"],
            isCorrect=bool(row["is_correct"]),
            createdAt=row["created_at"],
        ).model_dump()
        for row in rows
    ]


def get_leaderboard() -> list[dict]:
    with _connect() as connection:
        rows = connection.execute(
            """
            select
                id,
                name,
                appearance_id,
                total_score,
                challenges_attempted
            from avatars
            order by total_score desc, name collate nocase asc
            """
        ).fetchall()

    leaderboard = []
    for row in rows:
        challenges_attempted = row["challenges_attempted"]
        total_score = row["total_score"]
        accuracy = (
            round((total_score / challenges_attempted) * 100)
            if challenges_attempted
            else 0
        )
        leaderboard.append(
            LeaderboardEntry(
                avatarId=row["id"],
                avatarName=row["name"],
                appearanceId=row["appearance_id"],
                totalScore=total_score,
                challengesAttempted=challenges_attempted,
                accuracy=accuracy,
            ).model_dump()
        )

    return leaderboard


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
