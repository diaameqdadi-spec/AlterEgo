from dataclasses import dataclass


@dataclass
class Avatar:
    id: str
    name: str
    persona: str
    math_strategy: str
    appearance_id: str
    total_score: int = 0
    challenges_attempted: int = 0


@dataclass(frozen=True)
class Challenge:
    id: str
    prompt: str
    expected_answer: str
    challenge_type: str
