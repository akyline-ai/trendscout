<div align="center">
  <img src="client/public/logo192.png" alt="Rizko.ai Logo" width="120" height="120" />
  <h1>Rizko.ai</h1>
  <p><strong>TikTok & Instagram Trend Analysis Platform</strong></p>
  <p>SaaS-платформа для анализа трендов, отслеживания конкурентов, AI-генерации скриптов и визуального построения workflow.</p>
</div>

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Frontend (React 19)                   │
│              Vite 6 + TypeScript + Tailwind               │
│                  Cloudflare Pages / :5173                  │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API
┌────────────────────────▼─────────────────────────────────┐
│                  Backend (FastAPI + Python 3.11)           │
│                    Railway / localhost:8000                │
├───────────┬───────────┬───────────┬──────────────────────┤
│  Supabase │   Apify   │  Claude/  │    Supabase          │
│  Postgres │  Scraper  │  Gemini   │    Storage           │
│  (DB)     │  (Data)   │  (AI)     │    (Images)          │
└───────────┴───────────┴───────────┴──────────────────────┘
```

| Service | What | Where |
|---------|------|-------|
| **PostgreSQL** | Users, trends, competitors, workflows, chat | Supabase (cloud) |
| **Supabase Storage** | Avatars, thumbnails (bucket `rizko-images`) | Supabase (cloud) |
| **Supabase Auth** | Google OAuth | Supabase (cloud) |
| **Apify** | TikTok/Instagram scraping | Apify Cloud |
| **Claude / Gemini** | AI script generation, chat | Anthropic / Google |

---

## Quick Start

### Requirements
- **Node.js** 18+
- **Python** 3.11+
- No local database needed (Supabase cloud)

### 1. Clone

```bash
git clone https://github.com/akyline-ai/trendscout.git
cd trendscout
```

### 2. Backend (port 8000)

```bash
cd server
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

# Create .env (get values from team lead)
cp .env.example .env

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend (port 5173)

```bash
cd client
npm install
npm run dev
```

Open: http://localhost:5173

---

## Environment Variables

### Backend (`server/.env`)

```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.xxx:PASSWORD@aws-0-us-west-2.pooler.supabase.com:6543/postgres

# Supabase (Auth + Storage)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...

# External APIs
APIFY_API_TOKEN=apify_api_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GEMINI_API_KEY=AIza...

# Security
SECRET_KEY=your-secret-key-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=30

# TikTok OAuth
TIKTOK_CLIENT_KEY=xxx
TIKTOK_CLIENT_SECRET=xxx

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=https://api.rizko.ai
API_SECRET_KEY=xxx
DEV_UPGRADE_CODE=xxx
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Rizko.ai
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Project Structure

```
trendscout/
├── client/                         # Frontend (React 19 + Vite 6)
│   ├── src/
│   │   ├── pages/                  # 28 pages (see Routes below)
│   │   ├── components/ui/          # shadcn/ui components
│   │   ├── contexts/               # AuthContext, ChatContext, WorkflowContext
│   │   ├── hooks/                  # Custom hooks (useNetwork, usePWA, etc.)
│   │   ├── services/api.ts         # Axios API client
│   │   └── types/                  # TypeScript types
│   └── package.json
│
├── server/                         # Backend (FastAPI)
│   ├── app/
│   │   ├── api/                    # Endpoint handlers
│   │   │   ├── competitors.py      # Competitor search & tracking
│   │   │   ├── trends.py           # Trend search & scoring
│   │   │   ├── favorites.py        # Saved videos
│   │   │   ├── workflows.py        # Workflow CRUD & execution
│   │   │   ├── chat_sessions.py    # AI chat
│   │   │   ├── ai_scripts.py       # Script generation
│   │   │   ├── proxy.py            # Image proxy (CORS bypass)
│   │   │   ├── routes/auth.py      # Auth + OAuth
│   │   │   ├── routes/oauth.py     # TikTok/Google OAuth
│   │   │   ├── routes/stripe.py    # Subscriptions
│   │   │   ├── routes/usage.py     # Credits tracking
│   │   │   └── schemas/            # Pydantic schemas
│   │   ├── core/
│   │   │   ├── database.py         # SQLAlchemy engine (Supabase PG)
│   │   │   ├── config.py           # Settings from .env
│   │   │   └── security.py         # JWT, password hashing
│   │   ├── db/
│   │   │   ├── models.py           # 14 SQLAlchemy models
│   │   │   └── migrations/         # Alembic migrations
│   │   └── services/
│   │       ├── collector.py        # TikTok data collection (Apify)
│   │       ├── instagram_collector.py
│   │       ├── storage.py          # Supabase Storage (images)
│   │       ├── scorer.py           # UTS viral scoring
│   │       ├── video_analyzer.py   # AI video analysis
│   │       └── gemini_script_generator.py
│   ├── Dockerfile
│   ├── railway.toml
│   └── requirements.txt
│
├── ml-service/                     # ML microservice (optional)
└── README.md
```

---

## Database Schema (14 tables)

| Table | Purpose |
|-------|---------|
| `users` | Auth, credits, subscription tier |
| `user_settings` | Preferences (dark mode, language, notifications) |
| `trends` | Analyzed TikTok/IG videos with UTS score |
| `user_favorites` | Bookmarked trends |
| `user_searches` | Search history |
| `user_scripts` | Generated AI scripts |
| `chat_messages` | Chat history |
| `chat_sessions` | Chat conversations |
| `competitors` | Tracked TikTok/IG profiles |
| `user_accounts` | User's own social accounts |
| `profile_data` | Cached profile data |
| `feedback` | User feedback |
| `workflows` | Visual workflow definitions |
| `workflow_runs` | Workflow execution results |

All user data is isolated via `user_id` FK with `CASCADE` delete.

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register |
| POST | `/login` | Login |
| POST | `/refresh` | Refresh token |
| GET | `/me` | Current user |
| POST | `/oauth/sync` | Sync Google/TikTok OAuth |
| POST | `/dev/upgrade` | Dev mode plan upgrade |

### Trends (`/api/trends`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/search` | Search trends (Apify) |
| GET | `/results` | Get search results |
| GET | `/my-trends` | User's analyzed trends |

### Competitors (`/api/competitors`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?username=xxx` | Search TikTok/IG channel (5-7s) |
| POST | `/` | Add competitor to tracking |
| GET | `/` | List tracked competitors |
| DELETE | `/{id}` | Remove competitor |
| GET | `/{id}/feed` | Competitor's recent videos |

### Favorites (`/api/favorites`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List saved videos |
| POST | `/` | Save video |
| DELETE | `/{id}` | Remove from saved |

### AI (`/api/ai-scripts`, `/api/chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate` | Generate script (Gemini) |
| POST | `/chat` | AI chat (Claude/Gemini) |

### Workflows (`/api/workflows`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List workflows |
| POST | `/` | Create workflow |
| PUT | `/{id}` | Update workflow |
| POST | `/{id}/run` | Execute workflow |

---

## Subscription Tiers

| Tier | Price | Rate Limit | Credits/mo | Competitors |
|------|-------|------------|------------|-------------|
| **Free** | $0 | 10 req/min | 100 | 3 |
| **Creator** | $19/mo | 30 req/min | 1,000 | 10 |
| **Pro** | $49/mo | 100 req/min | 5,000 | 25 |
| **Agency** | $149/mo | 500 req/min | 10,000 | 100 |

---

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Cloudflare Pages | `npm run build` → deploy `dist/` |
| Backend | Railway | `Dockerfile` + `railway.toml` |
| Database | Supabase | PostgreSQL (managed) |
| Storage | Supabase | Bucket `rizko-images` |

### Railway deploy

```bash
# Auto: Dockerfile runs migrations + starts uvicorn
CMD sh -c "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
```

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 6, TypeScript 5.6, Tailwind CSS, shadcn/ui, React Router 7, TanStack Query, Framer Motion, Recharts, Sonner |
| **Backend** | FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic, python-jose (JWT), APScheduler |
| **Database** | Supabase PostgreSQL 17 (Transaction Pooler) |
| **AI** | Anthropic Claude, Google Gemini, OpenAI |
| **Data** | Apify (TikTok/Instagram scraping), Pillow + pillow-heif (HEIC conversion) |
| **Infra** | Railway (backend), Cloudflare Pages (frontend), Supabase (DB + Storage + Auth) |

---

## Dev Workflow

```bash
git checkout -b feature/my-feature
# develop & test
git push origin feature/my-feature
# create PR → code review → merge to main
```

**Commits**: Conventional Commits (`feat:`, `fix:`, `perf:`, `chore:`)

---

**Built by Akyline AI Team**
