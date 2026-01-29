# TrendScout AI - TikTok Trend Analysis Platform

Fullstack приложение для анализа трендов TikTok с AI-генерацией скриптов, машинным обучением и отслеживанием конкурентов.

## 📅 Changelog

### 2025-01-29
- ✅ Fix: Кнопка "Save Video" теперь показывает понятное сообщение для Light mode
- ✅ Fix: Исправлен маппинг `trend_id` для сохранения в избранное
- ✅ Add: Страницы DeepAnalysis, Feedback, Saved
- ✅ Add: Favorites API с изоляцией данных пользователей
- ✅ Add: Database migrations (Alembic)

### 2025-01-28
- ✅ Add: Deep Analyze progress component
- ✅ Add: Upgrade modal для PRO features
- ✅ Add: Competitors functionality

### 2025-01-26
- ✅ Add: Unified sidebar with tabs
- ✅ Add: Google OAuth authentication

---

## 🏗️ Архитектура (Microservices)

Проект разделен на 3 независимых сервиса для оптимального деплоя:

```
trendscout/
├── client/           # Frontend (Cloudflare Pages)
│   ├── src/          # React + TypeScript
│   └── README.md
│
├── server/           # Backend API (Railway)
│   ├── app/          # FastAPI + PostgreSQL
│   └── README.md
│
└── ml-service/       # ML Service (Railway)
    ├── app/          # CLIP + Anthropic Claude
    └── README.md
```

## 🚀 Быстрый старт (Development)

### 1. ML Service (порт 8001)

```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Создайте .env (см. ml-service/.env.example)
python -m app.main
```

### 2. Backend (порт 8000)

```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Создайте .env (см. server/.env.example)
# Укажите ML_SERVICE_URL=http://localhost:8001
python -m app.main
```

### 3. Frontend (порт 5173)

```bash
cd client
npm install

# Создайте .env: VITE_API_URL=http://localhost:8000/api
npm run dev
```

**Откройте**: http://localhost:5173

## 💎 Subscription Tiers

| Tier | Rate Limit | Deep Analyze | Save Videos |
|------|------------|--------------|-------------|
| FREE | 10 req/min | ❌ | ❌ |
| CREATOR | 30 req/min | ❌ | ❌ |
| PRO | 100 req/min | ✅ 20/день | ✅ |
| AGENCY | 500 req/min | ✅ 100/день | ✅ |

**Изменить tier через Supabase:**
```sql
UPDATE users SET subscription_tier = 'pro' WHERE email = 'user@example.com';
```

## 🌐 Production Deployment

**Полное руководство**: [DEPLOYMENT.md](./DEPLOYMENT.md)

### Рекомендуемая конфигурация:

| Сервис | Платформа | URL |
|--------|-----------|-----|
| Frontend | Cloudflare Pages | `https://your-app.pages.dev` |
| Backend | Railway.app | `https://your-backend.up.railway.app` |
| ML Service | Railway.app | `https://your-ml.up.railway.app` |
| Database | Supabase | `postgresql://...` |

## 🛠 Технологии

### Frontend (Client)
- **Vite 7** - Build tool
- **React 19** + TypeScript
- **Tailwind CSS** + shadcn/ui
- **React Router 7**
- **Recharts** - Графики

### Backend (Server)
- **FastAPI** - Web framework
- **PostgreSQL** + pgvector
- **SQLAlchemy** - ORM
- **Apify** - TikTok data collection
- **APScheduler** - Background tasks

### ML Service
- **PyTorch** + Transformers
- **CLIP** (OpenAI) - Image embeddings
- **Anthropic Claude** - AI generation
- **scikit-learn** - Clustering

## 🔥 Ключевые возможности

- ✅ **Deep Scan** - 6-уровневая система оценки трендов (UTS Score)
- ✅ **Visual Clustering** - Группировка похожего контента через CLIP
- ✅ **Auto Rescan** - Автоматическое отслеживание роста
- ✅ **AI Scripts** - Генерация TikTok сценариев
- ✅ **Competitor Tracking** - Мониторинг конкурентов
- ✅ **Real-time Search** - Поиск с кэшированием
- ✅ **User Data Isolation** - Изоляция данных между пользователями

## 📚 Документация

- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Полное руководство по деплою
- **Client**: [client/README.md](./client/README.md) - Frontend документация
- **Server**: [server/README.md](./server/README.md) - Backend документация
- **ML Service**: [ml-service/README.md](./ml-service/README.md) - ML документация

## 🔐 Environment Variables

### ML Service
```env
ANTHROPIC_API_KEY=sk-ant-xxx...
PORT=8001
```

### Backend
```env
DATABASE_URL=postgresql://...
APIFY_API_TOKEN=xxx...
ML_SERVICE_URL=http://localhost:8001
SECRET_KEY=xxx...
```

### Frontend
```env
VITE_API_URL=http://localhost:8000/api
```

## 🔒 Безопасность

- Никогда не коммитьте `.env` файлы
- Используйте `.env.example` как шаблон
- Храните секреты в переменных окружения
- Регулярно обновляйте зависимости

## 💰 Стоимость (примерная)

- **Free tier**: $0/месяц (с ограничениями)
- **Production**: ~$10/месяц
  - Cloudflare Pages: Free
  - Railway Backend: $5/месяц
  - Railway ML Service: $5/месяц
  - Supabase DB: Free

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 Лицензия

Создано для образовательных и коммерческих целей.

---

**Built with ❤️ using FastAPI, React, and Machine Learning**
