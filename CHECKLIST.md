# ✅ TrendScout AI - Deployment Checklist

Используйте этот чеклист для деплоя проекта.

---

## 📋 Pre-Deployment

### Local Testing

- [ ] Все 3 сервиса запускаются локально без ошибок
- [ ] ML Service отвечает на http://localhost:8001
- [ ] Backend подключается к ML Service
- [ ] Backend подключается к PostgreSQL
- [ ] Frontend подключается к Backend API
- [ ] Deep Scan работает корректно
- [ ] Кластеризация генерирует embeddings

**Команда для теста**: `./test-services.sh`

---

## 🗄️ Database Setup

### Supabase (рекомендуется)

- [ ] Создан аккаунт на https://supabase.com
- [ ] Создан новый проект
- [ ] Получен Connection String из Settings → Database
- [ ] Расширение pgvector установлено (автоматически)
- [ ] Таблицы будут созданы автоматически при первом запуске backend

**SQL для проверки pgvector**:
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

## 🤖 ML Service (Railway)

### 1. Deploy to Railway

- [ ] Создан аккаунт на https://railway.app
- [ ] New Project → Deploy from GitHub repo
- [ ] Root directory установлен: `/ml-service`
- [ ] Railway автоматически обнаружил `requirements.txt`

### 2. Environment Variables

Добавить в Railway Dashboard → Variables:

- [ ] `ANTHROPIC_API_KEY` = `sk-ant-xxx...`
- [ ] `PORT` = `8001`

### 3. Deployment

- [ ] Build запущен автоматически
- [ ] Build прошел успешно (проверить логи)
- [ ] Service запустился
- [ ] Получен public URL: `https://xxxxx.up.railway.app`

### 4. Testing

- [ ] Health check работает: `curl https://your-ml.railway.app/`
- [ ] Swagger docs доступны: `https://your-ml.railway.app/docs`
- [ ] Text embedding работает (через Swagger или curl)

**Сохраните ML Service URL** → понадобится для Backend!

---

## 🔧 Backend (Render)

### 1. Deploy to Render

- [ ] Создан аккаунт на https://railway.app
- [ ] New → Web Service
- [ ] Repository подключен
- [ ] Root directory установлен: `/server`
- [ ] Runtime: Python 3

### 2. Build Settings

- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `python -m app.main`
- [ ] Instance Type: Free (или Starter $7/mo)

### 3. Environment Variables

Добавить в Render Dashboard → Environment:

- [ ] `DATABASE_URL` = `postgresql://...` (из Supabase)
- [ ] `APIFY_API_TOKEN` = `your_apify_token`
- [ ] `ML_SERVICE_URL` = `https://your-ml.railway.app`
- [ ] `SECRET_KEY` = `генерируйте: secrets.token_urlsafe(32)`
- [ ] `PORT` = `8000`

### 4. Deployment

- [ ] Deploy запущен
- [ ] Build прошел успешно (~5-10 минут)
- [ ] Service запустился
- [ ] Логи показывают "Tables created successfully!"
- [ ] Получен public URL: `https://xxxxx.onrailway.app`

### 5. Testing

- [ ] Health check: `curl https://your-backend.onrailway.app/`
- [ ] API docs: `https://your-backend.onrailway.app/docs`
- [ ] ML Service connection работает (проверить логи)
- [ ] Database connection OK (проверить логи)

**Сохраните Backend URL** → понадобится для Frontend!

---

## 🎨 Frontend (Cloudflare Pages)

### 1. Deploy to Cloudflare

- [ ] Создан аккаунт на https://dash.cloudflare.com
- [ ] Workers & Pages → Create → Pages → Connect to Git
- [ ] Repository выбран
- [ ] Root directory: `/client`

### 2. Build Settings

- [ ] Framework preset: `Vite`
- [ ] Build command: `npm run build`
- [ ] Build output directory: `dist`

### 3. Environment Variables

Добавить в Cloudflare Pages → Settings → Environment variables:

- [ ] `VITE_API_URL` = `https://your-backend.onrailway.app/api`

### 4. Deployment

- [ ] Deploy запущен
- [ ] Build прошел успешно (~2-3 минуты)
- [ ] Site опубликован
- [ ] Получен public URL: `https://xxxxx.pages.dev`

### 5. Testing

- [ ] Сайт открывается: `https://your-frontend.pages.dev`
- [ ] Dashboard загружается
- [ ] API calls работают (проверить DevTools → Network)
- [ ] Search работает
- [ ] Deep Scan работает (если есть Apify credits)

---

## 🔐 Security & CORS

### Backend CORS Configuration

Обновить `server/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend.pages.dev",
        "http://localhost:5173"  # для локальной разработки
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

- [ ] CORS настроен с production URL
- [ ] Commit & push изменений
- [ ] Render auto-deploy выполнен

---

## 🧪 End-to-End Testing

### Critical User Flows

- [ ] **Search**: Поиск по ключевому слову работает
- [ ] **Deep Scan**: Deep Scan находит тренды и рассчитывает UTS
- [ ] **Clustering**: Визуальные группы создаются корректно
- [ ] **Profile**: Анализ профиля работает
- [ ] **Dashboard**: Отображает данные
- [ ] **AI Scripts**: Генерация скриптов работает (если настроен Claude)

### Performance

- [ ] Regular Search: < 10 секунд
- [ ] Deep Scan: < 30 секунд
- [ ] Page load: < 3 секунды
- [ ] API response: < 2 секунды

---

## 📊 Monitoring Setup

### Health Checks

- [ ] ML Service health: `https://your-ml.railway.app/`
- [ ] Backend health: `https://your-backend.onrailway.app/`
- [ ] Frontend health: `https://your-frontend.pages.dev/`

### Logs

- [ ] Railway logs доступны и читаются
- [ ] Render logs доступны и читаются
- [ ] Cloudflare analytics настроены

### Alerts

- [ ] Email alerts настроены в Railway
- [ ] Email alerts настроены в Render
- [ ] Supabase alerts настроены

---

## 📝 Documentation

### URLs Documentation

Документируйте все URLs в безопасном месте:

```
ML Service:    https://_____.up.railway.app
Backend API:   https://_____.onrailway.app
Frontend:      https://_____.pages.dev
Database:      postgresql://_____
```

### API Keys

Храните все ключи в password manager:

- [ ] APIFY_API_TOKEN
- [ ] ANTHROPIC_API_KEY
- [ ] DATABASE_URL
- [ ] SECRET_KEY

---

## 🎉 Post-Deployment

### Final Checks

- [ ] Все сервисы работают стабильно 24 часа
- [ ] Нет ошибок в логах
- [ ] Performance соответствует ожиданиям
- [ ] Backup database настроен (Supabase автоматически)

### Optional Enhancements

- [ ] Custom domain для Frontend (Cloudflare)
- [ ] CDN для статики
- [ ] Redis cache для Backend
- [ ] Sentry для error tracking
- [ ] Google Analytics

---

## 🚨 Troubleshooting

### Common Issues

**ML Service не отвечает**:
- Проверить логи Railway
- Убедиться что ANTHROPIC_API_KEY установлен
- Проверить health endpoint

**Backend не подключается к ML**:
- Проверить ML_SERVICE_URL правильный
- Проверить ML Service запущен
- Проверить CORS в ML Service

**Frontend не подключается к Backend**:
- Проверить VITE_API_URL правильный
- Проверить CORS в Backend
- Проверить DevTools → Console

**Database errors**:
- Проверить DATABASE_URL format
- Проверить pgvector установлен
- Проверить IP whitelist (Supabase)

---

## ✅ Completion

Когда все чекбоксы отмечены:

🎉 **Поздравляем! TrendScout AI успешно развернут!**

**Production URLs**:
- Frontend: `https://your-frontend.pages.dev`
- API Docs: `https://your-backend.onrailway.app/docs`
- ML Docs: `https://your-ml.railway.app/docs`

---

**Последнее обновление**: 2026-01-20
**Версия**: 1.0.0
