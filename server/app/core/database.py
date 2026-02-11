# backend/app/core/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

# 1. Создаем движок (Engine)
# Используем URL из настроек.
# Добавляем connect_args для стабильности (опционально)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,      # Проверяет соединение перед запросом
    pool_size=20,             # Базовый пул: 20 постоянных соединений
    max_overflow=20,          # Дополнительно: ещё 20 при нагрузке (итого 40 макс)
    pool_recycle=3600,        # Пересоздавать соединения каждый час (от stale connections)
    pool_timeout=30,          # Ждать свободное соединение макс 30 сек
    echo=False
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