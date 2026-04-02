from dataclasses import dataclass


@dataclass
class Avatar:
    id: str
    user_id: str
    name: str
    persona: str
    math_strategy: str
    appearance_id: str
    created_at: int
    total_score: int = 0
    challenges_attempted: int = 0


@dataclass(frozen=True)
class Challenge:
    id: str
    prompt: str
    expected_answer: str
    challenge_type: str


@dataclass(frozen=True)
class ChallengeAttempt:
    id: str
    avatar_id: str
    user_id: str
    question_id: str
    challenge_type: str
    submitted_answer: str
    expected_answer: str
    is_correct: bool
    created_at: int
