from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time
from pathlib import Path
from uuid import uuid4

from app.config import get_auth_secret, get_database_path


def _db_path() -> Path:
    return Path(get_database_path())


def init_auth_db() -> None:
    path = _db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(path) as connection:
        connection.execute(
            """
            create table if not exists users (
                id text primary key,
                email text not null unique,
                display_name text not null,
                password_hash text not null,
                created_at integer not null
            )
            """
        )
        connection.commit()


def _connect() -> sqlite3.Connection:
    init_auth_db()
    connection = sqlite3.connect(_db_path())
    connection.row_factory = sqlite3.Row
    return connection


def register_user(email: str, password: str, display_name: str) -> dict:
    normalized_email = email.strip().lower()
    normalized_name = display_name.strip()

    with _connect() as connection:
        existing = connection.execute(
            "select id from users where email = ?",
            (normalized_email,),
        ).fetchone()
        if existing is not None:
            raise ValueError("An account with that email already exists.")

        user_id = str(uuid4())
        created_at = int(time.time())
        password_hash = hash_password(password)

        connection.execute(
            """
            insert into users (id, email, display_name, password_hash, created_at)
            values (?, ?, ?, ?, ?)
            """,
            (user_id, normalized_email, normalized_name, password_hash, created_at),
        )
        connection.commit()

    return {
        "id": user_id,
        "email": normalized_email,
        "displayName": normalized_name,
        "createdAt": created_at,
    }


def authenticate_user(email: str, password: str) -> dict:
    normalized_email = email.strip().lower()

    with _connect() as connection:
        row = connection.execute(
            """
            select id, email, display_name, password_hash, created_at
            from users
            where email = ?
            """,
            (normalized_email,),
        ).fetchone()

    if row is None or not verify_password(password, row["password_hash"]):
        raise ValueError("Invalid email or password.")

    return {
        "id": row["id"],
        "email": row["email"],
        "displayName": row["display_name"],
        "createdAt": row["created_at"],
    }


def get_user_by_id(user_id: str) -> dict | None:
    with _connect() as connection:
        row = connection.execute(
            """
            select id, email, display_name, created_at
            from users
            where id = ?
            """,
            (user_id,),
        ).fetchone()

    if row is None:
        return None

    return {
        "id": row["id"],
        "email": row["email"],
        "displayName": row["display_name"],
        "createdAt": row["created_at"],
    }


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)
    return f"{base64.urlsafe_b64encode(salt).decode()}:{base64.urlsafe_b64encode(derived).decode()}"


def verify_password(password: str, password_hash: str) -> bool:
    salt_b64, digest_b64 = password_hash.split(":", 1)
    salt = base64.urlsafe_b64decode(salt_b64.encode())
    expected = base64.urlsafe_b64decode(digest_b64.encode())
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)
    return hmac.compare_digest(candidate, expected)


def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": int(time.time()) + (60 * 60 * 24 * 7),
        "nonce": secrets.token_hex(8),
    }
    body = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = _sign(body)
    return f"{body}.{signature}"


def verify_access_token(token: str) -> dict:
    try:
        body, signature = token.split(".", 1)
    except ValueError as error:
        raise ValueError("Invalid token.") from error

    if not hmac.compare_digest(signature, _sign(body)):
        raise ValueError("Invalid token signature.")

    payload = json.loads(_b64url_decode(body))
    if payload.get("exp", 0) < int(time.time()):
        raise ValueError("Token expired.")

    user = get_user_by_id(payload["sub"])
    if user is None:
        raise ValueError("User not found.")

    return user


def _sign(body: str) -> str:
    digest = hmac.new(
        get_auth_secret().encode("utf-8"),
        body.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return _b64url_encode(digest)


def _b64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("utf-8").rstrip("=")


def _b64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode((value + padding).encode("utf-8"))
