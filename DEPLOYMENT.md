# 🚀 TrendScout AI - Deployment Guide

Руководство по деплою 3 сервисов: Frontend (Cloudflare Pages), Backend + ML (Railway)

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
│  Railway.app    │  │  Railway.app  │
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

**Преимущества Railway для всего Backend:**
- ✅ Все Python сервисы в одном месте
- ✅ Простое управление
- ✅ Единый биллинг
- ✅ Автоматический HTTPS
- ✅ GPU support для ML
- ✅ Быстрый deployment (Nixpacks)

---

## 1️⃣ Database Setup (Supabase)

### Шаг 1: Создание проекта

1. Зайдите на https://supabase.com
2. Sign up / Login
3. **New Project**
4. Заполните:
   - Name: `trendscout-db`
   - Database Password: [генерируйте сильный пароль]
   - Region: выберите ближайший
5. **Create project** (займет 2-3 минуты)

### Шаг 2: Получение Connection String

1. Settings → Database
2. Скопируйте **Connection string** (URI mode)
3. Замените `[YOUR-PASSWORD]` на ваш пароль

Результат:
```
postgresql://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres
```

### Шаг 3: pgvector

pgvector уже установлен в Supabase! ✅

**Проверка** (опционально):
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

## 2️⃣ Backend Setup (Railway)

### Шаг 1: Создание аккаунта

1. Зайдите на https://railway.app
2. Sign up with GitHub
3. Authorize Railway

### Шаг 2: Создание проекта

1. **New Project**
2. **Deploy from GitHub repo**
3. Выберите ваш репозиторий `TrendScout-AI`
4. **Deploy** (Railway автоматически обнаружит структуру)

### Шаг 3: Настройка Backend Service

Railway создаст несколько сервисов автоматически. Настройте Backend:

1. В Dashboard выберите сервис с `server/`
2. **Settings**:
   - Name: `backend`
   - Root Directory: `/server`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m app.main`

3. **Variables** (Environment):

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST].supabase.co:5432/postgres
APIFY_API_TOKEN=your_apify_token_here
ML_SERVICE_URL=https://ml-service.up.railway.app
SECRET_KEY=[генерируйте: python -c "import secrets; print(secrets.token_urlsafe(32))"]
PORT=8000
```

4. **Deploy** (автоматически после сохранения)

### Шаг 4: Получение Backend URL

После успешного deployment:
1. Settings → Domains
2. **Generate Domain**
3. Получите URL: `https://backend-production-xxxx.up.railway.app`

**Сохраните этот URL!** Он понадобится для ML Service и Frontend.

### Проверка

```bash
curl https://your-backend.up.railway.app/
# Ответ: {"status": "ok", "version": "2.0.0", ...}
```

---

## 3️⃣ ML Service Setup (Railway)

### Шаг 1: Создание ML Service

В том же Railway проекте:

1. **New Service**
2. **Deploy from GitHub repo**
3. Выберите тот же репозиторий
4. Railway создаст новый сервис

### Шаг 2: Настройка ML Service

1. В Dashboard выберите новый сервис
2. **Settings**:
   - Name: `ml-service`
   - Root Directory: `/ml-service`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m app.main`

3. **Variables**:

```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
PORT=8001
```

4. **Deploy**

### Шаг 3: Получение ML Service URL

После deployment:
1. Settings → Domains
2. **Generate Domain**
3. Получите URL: `https://ml-service-production-xxxx.up.railway.app`

### Шаг 4: Обновить Backend

Вернитесь к Backend service и обновите `ML_SERVICE_URL`:

```env
ML_SERVICE_URL=https://ml-service-production-xxxx.up.railway.app
```

Сохраните → автоматический redeploy.

### Проверка

```bash
curl https://your-ml-service.up.railway.app/
# Ответ: {"status": "ok", "service": "ML Service", ...}
```

---

## 4️⃣ Frontend Setup (Cloudflare Pages)

### Шаг 1: Создание аккаунта

1. Зайдите на https://dash.cloudflare.com
2. Sign up / Login
3. Verify email

### Шаг 2: Создание проекта

1. **Workers & Pages** → **Create application**
2. **Pages** → **Connect to Git**
3. Authorize Cloudflare
4. Выберите репозиторий `TrendScout-AI`

### Шаг 3: Build Settings

```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /client
```

### Шаг 4: Environment Variables

В **Settings** → **Environment variables**:

```env
VITE_API_URL=https://your-backend.up.railway.app/api
```

**ВАЖНО**: Используйте URL Backend из Railway!

### Шаг 5: Deploy

1. **Save and Deploy**
2. Deployment займет 2-3 минуты

### Шаг 6: Получение URL

После deployment:
- **View site** или
- Получите URL: `https://trendscout-ai-xxx.pages.dev`

### Проверка

Откройте `https://your-app.pages.dev` в браузере:
- ✅ Сайт загружается
- ✅ Dashboard отображается
- ✅ API calls работают (F12 → Network)

---

## 🔧 Конфигурация CORS

После deployment обновите CORS в backend.

**Файл**: `server/app/main.py`

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.pages.dev",  # ← Ваш Cloudflare URL
        "http://localhost:5173"         # Для локальной разработки
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit → Push → Railway auto-deploy.

---

## 📊 Мониторинг

### Railway Dashboard

**Backend**:
- Logs: Real-time logs
- Metrics: CPU, Memory, Network
- Deployments: История деплоев

**ML Service**:
- Logs: Real-time logs
- Metrics: GPU usage (если включен)
- Deployments: История деплоев

### Cloudflare Analytics

- **Analytics** → **Web Analytics**
- Посещения, страны, устройства
- Core Web Vitals

### Supabase Dashboard

- **Database** → **Table Editor**
- **Database** → **Extensions**
- **Project Settings** → **Database** (usage)

---

## 🔐 Безопасность

### 1. API Keys

Все ключи хранятся в environment variables:
- ✅ APIFY_API_TOKEN
- ✅ ANTHROPIC_API_KEY
- ✅ DATABASE_URL
- ✅ SECRET_KEY

**Никогда не коммитьте .env файлы!**

### 2. Database

Supabase автоматически обеспечивает:
- ✅ SSL connections
- ✅ Daily backups
- ✅ IP restrictions (опционально)

### 3. CORS

Настроен только для вашего frontend домена.

### 4. Rate Limiting

**Cloudflare**:
- Автоматическая DDoS защита
- Rate limiting из коробки

**Railway**:
- Resource limits (512 MB RAM на free tier)

---

## 💰 Стоимость

| Сервис | Tier | Стоимость |
|--------|------|-----------|
| **Cloudflare Pages** | Free | $0/мес |
| **Railway Backend** | Hobby | $5/мес |
| **Railway ML** | Hobby | $5/мес |
| **Supabase** | Free | $0/мес |
| **Neo4j AuraDB** | Free | $0/мес (опционально) |
| **Total** | | **$10/мес** |

**Free tier** (для тестов):
- Railway: $5 credits/месяц
- Все остальное: Free
- **Total**: $0/мес (с ограничениями)

---

## 🚨 Troubleshooting

### Backend не запускается

**Проблема**: Build failed
**Решение**:
1. Проверьте логи в Railway
2. Убедитесь что `requirements.txt` корректен
3. Проверьте `python -m app.main` локально

**Проблема**: Database connection failed
**Решение**:
1. Проверьте `DATABASE_URL` правильный
2. Убедитесь что Supabase не в pause
3. Проверьте IP whitelist в Supabase

### ML Service не отвечает

**Проблема**: Health check fails
**Решение**:
1. Проверьте логи Railway
2. Убедитесь что `ANTHROPIC_API_KEY` установлен
3. Проверьте `pip install -r requirements.txt` прошел успешно

**Проблема**: Backend не подключается к ML
**Решение**:
1. Проверьте `ML_SERVICE_URL` в Backend variables
2. Убедитесь что ML Service deployment завершен
3. Test: `curl https://ml-service-url/`

### Frontend не подключается к Backend

**Проблема**: API calls fail
**Решение**:
1. Проверьте `VITE_API_URL` в Cloudflare
2. Проверьте CORS в `server/app/main.py`
3. Откройте DevTools (F12) → Console для ошибок
4. Проверьте Network tab

### Database ошибки

**Проблема**: pgvector extension not found
**Решение**:
- Supabase уже имеет pgvector! ✅
- Если нет, запустите: `CREATE EXTENSION vector;`

---

## 📝 Checklist

### Database
- [ ] Supabase проект создан
- [ ] Database password сохранен
- [ ] Connection string получен
- [ ] pgvector доступен

### Railway Backend
- [ ] GitHub repo подключен
- [ ] Backend service настроен
- [ ] Environment variables установлены
- [ ] Deployment успешный
- [ ] Health check работает
- [ ] Domain сгенерирован

### Railway ML Service
- [ ] ML service создан
- [ ] Root directory установлен (`/ml-service`)
- [ ] Environment variables установлены
- [ ] Deployment успешный
- [ ] Health check работает
- [ ] Domain сгенерирован
- [ ] Backend обновлен с ML_SERVICE_URL

### Cloudflare Pages
- [ ] GitHub repo подключен
- [ ] Build settings правильные
- [ ] Environment variables установлены
- [ ] Deployment успешный
- [ ] Site загружается
- [ ] API calls работают

### Final Checks
- [ ] CORS настроен правильно
- [ ] Все URLs документированы
- [ ] API keys сохранены в password manager
- [ ] Все сервисы работают стабильно
- [ ] Мониторинг настроен

---

## 🎉 Готово!

После завершения всех шагов:

✅ **Frontend**: `https://your-app.pages.dev`
✅ **Backend API**: `https://your-backend.up.railway.app`
✅ **ML Service**: `https://your-ml.up.railway.app`
✅ **Database**: Supabase PostgreSQL

**TrendScout AI полностью развернут и готов к использованию!** 🚀

---

## 📖 Дополнительно

### Custom Domain (Cloudflare)

1. Cloudflare Pages → Settings → Domains
2. **Add custom domain**
3. Следуйте инструкциям
4. Обновите CORS в backend

### Scaling

**Railway**:
- Settings → Resources
- Увеличить RAM/CPU
- Включить autoscaling

**Supabase**:
- Upgrade to Pro ($25/мес)
- Больше connections
- Automatic backups

### Monitoring

**Recommended**:
- Sentry для error tracking
- LogRocket для session replay
- Better Stack для uptime monitoring

---

**Версия**: 2.0 (Railway Edition)
**Последнее обновление**: 2026-01-20
