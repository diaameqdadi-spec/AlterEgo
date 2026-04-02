import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parents[1]


def get_openai_api_key() -> str | None:
    value = os.getenv("OPENAI_API_KEY", "").strip()
    return value or None


def get_openai_model() -> str:
    return os.getenv("ALTEREGO_OPENAI_MODEL", "gpt-5.4-mini").strip()


def get_auth_secret() -> str:
    return os.getenv("ALTEREGO_AUTH_SECRET", "alter-ego-dev-secret-change-me").strip()


def get_database_path() -> str:
    value = os.getenv("ALTEREGO_SQLITE_PATH", "").strip()
    if value:
        return value
    return str(BASE_DIR / "data" / "alterego.db")


def get_cors_origin_regex() -> str:
    value = os.getenv("ALTEREGO_CORS_ORIGIN_REGEX", "").strip()
    if value:
        return value
    return r"https?://(localhost|127\.0\.0\.1)(:\d+)?"
