import os
from datetime import datetime, timedelta

from jose import jwt
from passlib.context import CryptContext


# NOTE: bcrypt wheels often lag behind bleeding-edge Python versions.
# Use a pure-Python scheme so auth works reliably in dev environments.
PWD_CONTEXT = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

JWT_SECRET = os.getenv("RESUMIND_JWT_SECRET", "dev-secret-change-me")
JWT_ALG = os.getenv("RESUMIND_JWT_ALG", "HS256")
JWT_EXPIRES_MIN = int(os.getenv("RESUMIND_JWT_EXPIRES_MIN", "43200"))  # 30 days


def hash_password(password: str) -> str:
    return PWD_CONTEXT.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return PWD_CONTEXT.verify(password, password_hash)


def create_access_token(*, user_id: int, email: str) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRES_MIN)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
