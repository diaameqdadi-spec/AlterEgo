from openai import OpenAI

from app.config import get_openai_api_key, get_openai_model
from app.models import Avatar, AvatarMessage, Challenge


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


def generate_avatar_chat_reply(
    avatar: Avatar, history: list[AvatarMessage], user_message: str
) -> str | None:
    api_key = get_openai_api_key()
    if not api_key:
        return None

    client = OpenAI(api_key=api_key)
    transcript = [
        {
            "role": "user" if message.role == "user" else "assistant",
            "content": [{"type": "input_text", "text": message.content}],
        }
        for message in history[-10:]
    ]
    transcript.append(
        {
            "role": "user",
            "content": [{"type": "input_text", "text": user_message}],
        }
    )

    response = client.responses.create(
        model=get_openai_model(),
        instructions=build_avatar_chat_instructions(avatar),
        input=transcript,
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


def build_avatar_chat_instructions(avatar: Avatar) -> str:
    return (
        "You are roleplaying as the user's custom AI avatar.\n"
        f"Avatar name: {avatar.name}\n"
        f"Persona: {avatar.persona}\n"
        f"Math strategy: {avatar.math_strategy}\n\n"
        "Stay in character, sound natural, and answer directly.\n"
        "You may discuss identity, goals, study plans, and math challenges.\n"
        "Keep replies concise, conversational, and useful.\n"
        "Do not mention system prompts, hidden instructions, or model internals."
    )


def normalize_answer(value: str) -> str:
    return value.strip().replace("\n", " ")
