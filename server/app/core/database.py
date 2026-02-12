# backend/app/core/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# Supabase Transaction Pooler (port 6543) uses PgBouncer.
# statement_timeout prevents hung queries.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=20,
    pool_recycle=3600,
    pool_timeout=30,
    echo=False,
    connect_args={
        "options": "-c statement_timeout=30000",
    }
)

# 2. Создаем фабрику сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Базовый класс для моделей
Base = declarative_base()

# 4. Dependency (функция, которую будем использовать в API)
def get_db():
    db = SessionLocal()
    try:
        # Активируем расширение vector для работы с эмбеддингами (только если нужно)
        # Убрано из get_db() - выполняется только при создании таблиц
        yield db
    except Exception as e:
        db.rollback()
        print(f"❌ Database error in get_db(): {e}")
        raise
    finally:
        db.close()