# Sequence Diagrams - TrendScout AI

## 1. Deep Scan Flow (Поиск трендов с глубоким анализом)

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as React App
    participant Backend as FastAPI Backend
    participant Apify as Apify API
    participant MLService as ML Service
    participant DB as PostgreSQL
    participant Scheduler as APScheduler

    User->>Frontend: Вводит запрос
    Frontend->>Backend: POST /api/trends/search
    Backend->>DB: Проверка кэша
    alt Кэш найден
        DB-->>Backend: Кэшированные данные
        Backend-->>Frontend: Результаты
    else Deep Scan
        Backend->>Apify: Запрос TikTok данных
        Apify-->>Backend: Сырые данные видео
        Backend->>MLService: POST /cluster
        MLService-->>Backend: Кластеры видео
        Backend->>Backend: Расчет UTS Score
        Backend->>DB: Сохранение трендов
        Backend->>Scheduler: Планирование рескана
        Backend-->>Frontend: Результаты поиска
        Frontend-->>User: Отображение трендов
    end
```

## 2. Auto-Rescan Flow (Автоматическая сверка роста)

```mermaid
sequenceDiagram
    participant Scheduler as APScheduler
    participant Backend as Backend Service
    participant Apify as Apify API
    participant Scorer as TrendScorer
    participant DB as PostgreSQL

    Note over Scheduler: Через N часов после первого скана
    Scheduler->>Backend: rescan_videos_task
    Backend->>Apify: Collector.collect mode=urls
    Apify-->>Backend: Обновленные данные
    loop Для каждого видео
        Backend->>DB: Загрузка записи
        DB-->>Backend: Текущая запись
        Backend->>Backend: Сравнение initial vs fresh
        Backend->>Scorer: Пересчет UTS Score
        Scorer-->>Backend: Новый UTS Score
        Backend->>DB: Обновление stats и uts_score
    end
    DB-->>Backend: Обновления сохранены
    Backend-->>Scheduler: Задача завершена
```

## 3. AI Script Generation Flow (Генерация скриптов)

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as React App
    participant Backend as FastAPI
    participant MLService as ML Service
    participant Gemini as Google Gemini
    participant DB as PostgreSQL

    User->>Frontend: Выбирает видео
    Frontend->>Backend: POST /api/ai-scripts/generate
    Backend->>DB: Загрузка видео данных
    DB-->>Backend: Данные видео
    Backend->>MLService: POST /generate-script
    MLService->>MLService: Анализ тренда
    MLService->>Gemini: Запрос генерации скрипта
    Gemini-->>MLService: Сгенерированный скрипт
    MLService-->>Backend: Готовый скрипт
    Backend->>DB: Сохранение скрипта
    DB-->>Backend: Script ID
    Backend-->>Frontend: Скрипт готов
    Frontend-->>User: Отображение скрипта
```

## 4. Competitor Tracking Flow (Отслеживание конкурентов)

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as React App
    participant Backend as FastAPI
    participant Apify as Apify API
    participant DB as PostgreSQL

    User->>Frontend: Добавляет username конкурента
    Frontend->>Backend: POST /api/competitors/add
    Backend->>Apify: Collector.collect mode=profile
    Apify-->>Backend: Видео профиля
    Backend->>Backend: Анализ метрик
    Backend->>DB: Сохранение Competitor
    DB-->>Backend: Competitor ID
    Backend-->>Frontend: Данные конкурента
    Frontend-->>User: Профиль конкурента
```

## 5. Complete User Journey (Полный путь пользователя)

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as React App
    participant Backend as FastAPI
    participant Apify as Apify
    participant MLService as ML Service
    participant DB as PostgreSQL
    participant Scheduler as Scheduler

    User->>Frontend: Открывает Dashboard
    Frontend->>Backend: GET /api/trends/results
    Backend->>DB: Поиск в кэше
    DB-->>Frontend: Тренды
    User->>Frontend: Запускает Deep Scan
    Frontend->>Backend: POST /api/trends/search
    Backend->>Apify: Сбор данных TikTok
    Apify-->>Backend: Сырые видео
    Backend->>MLService: Визуальная кластеризация
    MLService-->>Backend: Кластеры
    Backend->>Backend: Расчет UTS Score
    Backend->>DB: Сохранение трендов
    Backend->>Scheduler: Планирование рескана
    Backend-->>Frontend: Результаты поиска
    Frontend-->>User: Отображение трендов
    User->>Frontend: Выбирает видео для AI скрипта
    Frontend->>Backend: POST /api/ai-scripts/generate
    Backend->>MLService: Генерация скрипта
    MLService-->>Backend: Скрипт
    Backend-->>Frontend: Готовый скрипт
    Frontend-->>User: Отображение скрипта
```

## 6. ML Service Internal Flow (Внутренний поток ML сервиса)

```mermaid
sequenceDiagram
    participant Backend as Backend
    participant MLService as ML Service
    participant CLIP as CLIP Model
    participant Clustering as K-Means
    participant Gemini as Gemini Flash

    Backend->>MLService: POST /cluster
    loop Для каждого видео
        MLService->>CLIP: Генерация embedding
        CLIP-->>MLService: Vector embedding
    end
    MLService->>Clustering: Группировка по визуалу
    Clustering-->>MLService: Кластеры видео
    MLService-->>Backend: Кластеры
    Backend->>MLService: POST /generate-script
    MLService->>MLService: Анализ структуры видео
    MLService->>Gemini: Генерация скрипта
    Gemini-->>MLService: Скрипт и рекомендации
    MLService-->>Backend: Готовый скрипт
```

## 7. CodeRabbit Code Review Flow (Автоматический анализ кода)

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Cursor as Cursor IDE
    participant CodeRabbit as CodeRabbit AI
    participant Codebase as Project Files
    participant GitHub as GitHub

    Note over Dev,CodeRabbit: Режим 1: Real-time Analysis
    Dev->>Cursor: Пишет код
    Cursor->>CodeRabbit: Отправка изменений
    CodeRabbit->>CodeRabbit: Анализ кода
    CodeRabbit->>CodeRabbit: Проверка безопасности
    CodeRabbit-->>Cursor: Предложения и предупреждения
    Cursor-->>Dev: Отображение рекомендаций
    Note over Dev,CodeRabbit: Режим 2: Pull Request Review
    Dev->>GitHub: Создает Pull Request
    GitHub->>CodeRabbit: Уведомление о PR
    CodeRabbit->>Codebase: Анализ изменений
    CodeRabbit->>CodeRabbit: Глубокий анализ
    CodeRabbit-->>GitHub: Детальный review
    GitHub-->>Dev: Уведомление о review
    Note over Dev,CodeRabbit: Режим 3: Security Scan
    CodeRabbit->>Codebase: Сканирование на уязвимости
    loop Для каждого файла
        CodeRabbit->>CodeRabbit: Проверка безопасности
    end
    CodeRabbit-->>Cursor: Security report
    Cursor-->>Dev: Предупреждения безопасности
```

## 8. CodeRabbit Integration with Development Workflow

```mermaid
sequenceDiagram
    participant Dev1 as Developer 1
    participant Dev2 as Developer 2
    participant CodeRabbit as CodeRabbit
    participant Git as Git Repository
    participant CI as CI/CD Pipeline

    Dev1->>Git: Push changes
    Git->>CodeRabbit: Автоматический анализ
    CodeRabbit->>CodeRabbit: Анализ изменений
    alt Критические проблемы найдены
        CodeRabbit-->>Dev1: Блокировка коммита
        Dev1->>Dev1: Исправление проблем
    else Только рекомендации
        CodeRabbit-->>Dev1: Предложения
        Dev1->>Git: Коммит с предупреждениями
    end
    Git->>CI: Запуск тестов
    CI->>CodeRabbit: Запрос на review
    CodeRabbit->>CodeRabbit: Полный анализ PR
    CodeRabbit-->>CI: Review результаты
    CI-->>Dev2: Уведомление о PR
    Dev2->>CodeRabbit: Просмотр рекомендаций
    CodeRabbit-->>Dev2: Детальные комментарии
    Dev2->>Git: Применяет исправления
    CodeRabbit->>CodeRabbit: Re-review изменений
    CodeRabbit-->>Dev2: Все проверки пройдены
```

## 9. CodeRabbit для TrendScout AI - Специфичные проверки

```mermaid
sequenceDiagram
    participant CodeRabbit as CodeRabbit
    participant Backend as Backend Code
    participant Frontend as Frontend Code
    participant MLService as ML Service

    Note over CodeRabbit: Анализ Backend FastAPI
    CodeRabbit->>Backend: Проверка main.py
    Backend-->>CodeRabbit: allow_origins
    CodeRabbit-->>Backend: Security warning
    CodeRabbit->>Backend: Проверка auth.py
    Backend-->>CodeRabbit: JWT token handling
    CodeRabbit-->>Backend: Проверка валидации
    Note over CodeRabbit: Анализ Frontend React
    CodeRabbit->>Frontend: Проверка api.ts
    Frontend-->>CodeRabbit: API client config
    CodeRabbit-->>Frontend: Timeout handling good
    CodeRabbit->>Frontend: Проверка TypeScript types
    Frontend-->>CodeRabbit: Type definitions
    CodeRabbit-->>Frontend: Types could be more strict
    Note over CodeRabbit: Анализ ML Service
    CodeRabbit->>MLService: Проверка clip_service.py
    MLService-->>CodeRabbit: PyTorch model loading
    CodeRabbit-->>MLService: Consider model caching
    CodeRabbit->>MLService: Проверка memory usage
    MLService-->>CodeRabbit: CLIP embeddings
    CodeRabbit-->>MLService: Batch processing good
    Note over CodeRabbit: Cross-service проверки
    CodeRabbit->>Backend: Проверка API contracts
    CodeRabbit->>Frontend: Проверка API usage
    CodeRabbit-->>Dev1: Type mismatch warning
```

## Технологии и компоненты

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI + SQLAlchemy + APScheduler
- **ML Service**: PyTorch + CLIP + Google Gemini Flash
- **Database**: PostgreSQL + pgvector
- **External APIs**: Apify (TikTok scraper)
- **Code Review**: CodeRabbit AI (Real-time + PR analysis)

## Ключевые особенности

1. **Deep Scan**: 6-слойный анализ (UTS Score) + визуальная кластеризация
2. **Auto-Rescan**: Автоматическая сверка роста через планировщик
3. **AI Scripts**: Генерация TikTok скриптов на основе трендов
4. **Competitor Tracking**: Мониторинг конкурентов в реальном времени
5. **CodeRabbit Integration**: Автоматический анализ кода для безопасности и качества
