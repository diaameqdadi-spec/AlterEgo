from openai import OpenAI

from app.config import get_openai_api_key, get_openai_model
from app.models import Avatar, Challenge


def generate_math_answer(avatar: Avatar, challenge: Challenge) -> str | None:
    api_key = get_openai_api_key()
    if not api_key:
        return None

    client = OpenAI(api_key=api_key)
    response = client.responses.create(
        model=get_openai_model(),
        instructions=build_instructions(avatar),
        input=challenge.prompt,
    )
    return normalize_answer(response.output_text)


def build_instructions(avatar: Avatar) -> str:
    return (
        "You are competing in a math benchmark.\n"
        f"Avatar name: {avatar.name}\n"
        f"Persona: {avatar.persona}\n"
        f"Math strategy: {avatar.math_strategy}\n\n"
        "Solve the math problem carefully.\n"
        "Return only the final answer.\n"
        "Do not include explanation, units, or extra words unless the answer requires them."
    )


def normalize_answer(value: str) -> str:
    return value.strip().replace("\n", " ")

