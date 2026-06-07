import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Supports both SQLite (local dev) and PostgreSQL (Vercel/Neon production)
DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    # Local development fallback — SQLite
    DB_DIR = os.getenv("DB_DIR", ".")
    os.makedirs(DB_DIR, exist_ok=True)
    DATABASE_URL = f"sqlite:///{DB_DIR}/sql_app.db"

# Neon/Render provide "postgres://" but SQLAlchemy needs "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
