# 🚀 TrendScout AI - Deployment Guide

Руководство по деплою 3 сервисов: Frontend (Cloudflare Pages), Backend (Render), ML Service (Railway)

---

## 📋 Обзор архитектуры

```
┌─────────────────┐
│  Cloudflare     │
│  Pages          │  Frontend (React)
│  Port: 443      │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼────────┐  ┌────▼──────────┐
│  Render.com     │  │  Railway.app  │
│  Backend        │  │  ML Service   │
│  Port: 8000     │  │  Port: 8001   │
└────────┬────────┘  └───────────────┘
         │
┌────────▼────────┐
│  Supabase       │
│  PostgreSQL     │
│  + pgvector     │
└─────────────────┘
```

---

## 1️⃣ ML Service (Railway)

### Порядок действий

1. **Создайте аккаунт на Railway.app**
   - Зайдите на https://railway.app
   - Sign up / Login

2. **Создайте новый проект**
   - New Project → Deploy from GitHub repo
   - Выберите ваш репозиторий
   - Root directory: `/ml-service`

3. **Настройте переменные окружения**

   В Railway Dashboard → Variables:
   ```env
   ANTHROPIC_API_KEY=sk-ant-xxx...
   PORT=8001
   ```

4. **Деплой**
   - Railway автоматически обнаружит `requirements.txt`
   - Build command: `pip install -r requirements.txt`
   - Start command: `python -m app.main`
   - Деплой запустится автоматически

5. **Получите URL**
   - После деплоя получите URL типа: `https://trendscout-ml-production.up.railway.app`
   - **Сохраните этот URL** - он понадобится для Backend!

### Проверка

```bash
curl https://your-ml-service.railway.app/
# Ответ: {"status": "ok", "service": "ML Service"}
```

---

## 2️⃣ Backend (Render.com)

### Порядок действий

1. **Создайте аккаунт на Render.com**
   - Зайдите на https://render.com
   - Sign up / Login

2. **Создайте PostgreSQL базу данных (если еще нет)**

   **Вариант A: Supabase (рекомендуется)**
   - Зайдите на https://supabase.com
   - Создайте проект
   - Settings → Database → Connection String
   - Скопируйте Connection String

   **Вариант B: Render PostgreSQL**
   - New → PostgreSQL
   - Выберите план (Free для тестов)
   - Скопируйте Internal Database URL

3. **Создайте Web Service**
   - New → Web Service
   - Connect your repository
   - Root directory: `/server`
   - Runtime: Python 3

4. **Настройте переменные окружения**

   В Render Dashboard → Environment:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database
   APIFY_API_TOKEN=your_apify_token
   ML_SERVICE_URL=https://your-ml-service.railway.app
   SECRET_KEY=your_random_secret_key_here
   PORT=8000
   ```

5. **Настройте Build & Start**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m app.main`

6. **Деплой**
   - Нажмите "Create Web Service"
   - Деплой займет 5-10 минут

7. **Получите URL**
   - После деплоя получите URL типа: `https://trendscout-backend.onrender.com`
   - **Сохраните этот URL** - он понадобится для Frontend!

### Проверка

```bash
curl https://your-backend.onrender.com/
# Ответ: {"status": "ok", "version": "2.0.0", ...}
```

---

## 3️⃣ Frontend (Cloudflare Pages)

### Порядок действий

1. **Создайте аккаунт на Cloudflare**
   - Зайдите на https://dash.cloudflare.com
   - Sign up / Login

2. **Перейдите в Pages**
   - Workers & Pages → Create application → Pages
   - Connect to Git

3. **Настройте проект**
   - Выберите репозиторий
   - Build configuration:
     ```
     Framework preset: Vite
     Build command: npm run build
     Build output directory: dist
     Root directory: /client
     ```

4. **Настройте переменные окружения**

   В Cloudflare Pages → Settings → Environment variables:
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

5. **Деплой**
   - Save and Deploy
   - Деплой займет 2-3 минуты

6. **Получите URL**
   - После деплоя получите URL типа: `https://trendscout-client.pages.dev`
   - Можно настроить custom domain

### Проверка

- Откройте `https://your-frontend.pages.dev`
- Должен загрузиться интерфейс TrendScout

---

## 🔧 Конфигурация CORS

После деплоя обновите CORS в backend:

Файл `server/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend.pages.dev",
        "http://localhost:5173"  # Для локальной разработки
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 Мониторинг

### Railway (ML Service)
- Dashboard → Metrics
- Логи в реальном времени

### Render (Backend)
- Dashboard → Logs
- Метрики CPU/Memory

### Cloudflare Pages (Frontend)
- Analytics → Web Analytics
- Логи деплоев

---

## 🔐 Безопасность

### Обязательные шаги:

1. **Измените SECRET_KEY в backend**
   ```python
   import secrets
   secrets.token_urlsafe(32)
   ```

2. **Настройте rate limiting** (в production)

3. **Включите HTTPS** (автоматически на всех платформах)

4. **Регулярно обновляйте зависимости**
   ```bash
   pip list --outdated
   npm outdated
   ```

---

## 🚨 Troubleshooting

### ML Service не отвечает
- Проверьте логи Railway
- Убедитесь, что `ANTHROPIC_API_KEY` установлен
- Проверьте health check: `curl https://ml-service-url/`

### Backend не подключается к ML Service
- Проверьте `ML_SERVICE_URL` в переменных окружения
- Убедитесь, что ML Service развернут и работает

### Frontend не подключается к Backend
- Проверьте `VITE_API_URL` в Cloudflare Pages
- Проверьте CORS настройки в backend
- Откройте DevTools (F12) → Console для ошибок

### База данных не подключается
- Проверьте `DATABASE_URL` format
- Убедитесь, что pgvector extension установлен:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

---

## 💰 Стоимость (примерная)

| Сервис | Тариф | Стоимость |
|--------|-------|-----------|
| Cloudflare Pages | Free | $0/месяц |
| Render.com Backend | Free | $0/месяц (sleep after 15 min) |
| Render.com Backend | Starter | $7/месяц |
| Railway ML Service | Free Trial | $5 credits |
| Railway ML Service | Hobby | $5/месяц |
| Supabase DB | Free | $0/месяц (500 MB) |

**Total (Free tier)**: $0/месяц (с ограничениями)
**Total (Production)**: ~$12-15/месяц

---

## 📝 Checklist деплоя

- [ ] ML Service развернут на Railway
- [ ] ML Service URL получен и работает
- [ ] PostgreSQL база данных создана (Supabase)
- [ ] Backend развернут на Render
- [ ] Backend URL получен и работает
- [ ] Backend подключен к ML Service
- [ ] Backend подключен к PostgreSQL
- [ ] Frontend развернут на Cloudflare Pages
- [ ] Frontend подключен к Backend API
- [ ] CORS настроен правильно
- [ ] Все API ключи установлены
- [ ] Health checks проходят успешно
- [ ] Тестирование всех функций выполнено

---

## 🎉 Готово!

После завершения всех шагов у вас будет:

✅ **Frontend**: https://your-app.pages.dev
✅ **Backend API**: https://your-backend.onrender.com
✅ **ML Service**: https://your-ml.railway.app
✅ **Database**: Supabase PostgreSQL

**Ваш TrendScout AI полностью развернут и готов к использованию!** 🚀
