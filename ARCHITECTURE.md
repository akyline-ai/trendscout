# 🏗️ TrendScout AI - Architecture Overview

Детальная архитектура microservices для TrendScout AI.

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                         │
│              https://trendscout.pages.dev               │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS
                     │
┌────────────────────▼────────────────────────────────────┐
│              CLOUDFLARE PAGES                           │
│          Static Frontend (React SPA)                    │
│              Port: 443 (HTTPS)                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ REST API
                     │
        ┌────────────┴──────────────┐
        │                           │
┌───────▼──────────┐     ┌──────────▼────────────┐
│   RENDER.COM     │     │   RAILWAY.APP         │
│   Backend API    │◄────┤   ML Service          │
│   Port: 8000     │     │   Port: 8001          │
└───────┬──────────┘     └───────────────────────┘
        │
        │ SQL
        │
┌───────▼──────────┐
│   SUPABASE       │
│   PostgreSQL     │
│   + pgvector     │
└──────────────────┘
```

---

## 🔧 Service Details

### 1. Frontend (Client)

**Platform**: Cloudflare Pages
**Stack**: Vite + React 19 + TypeScript
**Port**: 443 (HTTPS)

**Responsibilities**:
- User interface rendering
- State management
- API calls to Backend
- Client-side routing
- Real-time updates

**Key Files**:
```
client/
├── src/
│   ├── pages/          # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Discover.tsx
│   │   ├── Trending.tsx
│   │   ├── AIScripts.tsx
│   │   └── Competitors.tsx
│   ├── components/     # UI components (shadcn/ui)
│   ├── hooks/          # React hooks
│   ├── services/       # API client
│   └── types/          # TypeScript types
├── .env               # VITE_API_URL
└── package.json
```

**Environment Variables**:
- `VITE_API_URL` - Backend API URL

---

### 2. Backend (Server)

**Platform**: Railway.app
**Stack**: FastAPI + PostgreSQL + SQLAlchemy
**Port**: 8000

**Responsibilities**:
- Business logic
- Data persistence
- TikTok data collection (Apify)
- Trend scoring (UTS algorithm)
- Background scheduling
- API endpoints

**Key Modules**:
```
server/
├── app/
│   ├── api/            # API endpoints
│   │   ├── trends.py       # POST /search, GET /results
│   │   ├── profiles.py     # GET /{username}
│   │   └── competitors.py  # Competitor tracking
│   ├── services/       # Business logic
│   │   ├── collector.py    # Apify data collection
│   │   ├── scorer.py       # UTS scoring algorithm
│   │   ├── clustering.py   # Visual clustering
│   │   ├── scheduler.py    # Auto-rescan tasks
│   │   ├── filter.py       # Data filtering
│   │   ├── adapter.py      # Data transformation
│   │   └── ml_client.py    # ML Service client
│   ├── db/             # Database
│   │   └── models.py       # SQLAlchemy models
│   └── core/           # Config
│       ├── config.py       # Settings
│       └── database.py     # DB connection
├── .env               # Secrets
└── requirements.txt
```

**API Endpoints**:
- `GET /` - Health check
- `POST /api/trends/search` - Search trends
- `GET /api/trends/results` - Get cached results
- `GET /api/profiles/{username}` - Profile analysis
- `GET /api/profiles/{username}/spy` - Spy mode

**Environment Variables**:
- `DATABASE_URL` - PostgreSQL connection
- `APIFY_API_TOKEN` - TikTok scraping
- `ML_SERVICE_URL` - ML Service URL
- `SECRET_KEY` - JWT secret

---

### 3. ML Service

**Platform**: Railway.app
**Stack**: FastAPI + PyTorch + Transformers
**Port**: 8001

**Responsibilities**:
- CLIP embeddings generation
- Image similarity analysis
- AI text generation (Claude)
- Batch processing

**Key Modules**:
```
ml-service/
├── app/
│   ├── main.py         # FastAPI app
│   └── services/
│       ├── clip_service.py     # CLIP embeddings
│       └── ai_service.py       # Claude AI
├── .env               # ANTHROPIC_API_KEY
└── requirements.txt
```

**API Endpoints**:
- `GET /` - Health check
- `POST /embeddings/text` - Text → Vector (512d)
- `POST /embeddings/image` - Image → Vector (512d)
- `POST /embeddings/batch-images` - Batch processing
- `POST /ai/trend-summary` - AI summary generation

**Environment Variables**:
- `ANTHROPIC_API_KEY` - Claude API key
- `PORT` - Service port (8001)

**Models**:
- `openai/clip-vit-base-patch32` - 149M parameters
- `claude-3-5-haiku-20241022` - Fast AI model

---

## 🗄️ Database Schema

**Platform**: Supabase PostgreSQL
**Extensions**: pgvector

### Tables

#### `trends`
```sql
CREATE TABLE trends (
    id SERIAL PRIMARY KEY,
    platform_id VARCHAR UNIQUE,
    url VARCHAR UNIQUE,
    description TEXT,
    cover_url VARCHAR,
    vertical VARCHAR,

    -- Music
    music_id VARCHAR,
    music_title VARCHAR,

    -- Author
    author_username VARCHAR,
    author_followers INTEGER,

    -- Stats (JSONB)
    stats JSONB,              -- Current stats
    initial_stats JSONB,      -- Point A (snapshot)
    last_scanned_at TIMESTAMP,

    -- Scoring
    uts_score FLOAT,          -- 0-10 score
    cluster_id INTEGER,       -- Visual group ID
    similarity_score FLOAT,
    reach_score FLOAT,
    uplift_score FLOAT,

    -- AI
    ai_summary TEXT,
    embedding VECTOR(512),    -- CLIP embedding

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON trends (author_username);
CREATE INDEX ON trends (vertical);
CREATE INDEX ON trends (uts_score DESC);
CREATE INDEX ON trends (cluster_id);
```

#### `profile_data`
```sql
CREATE TABLE profile_data (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE,

    channel_data JSONB,       -- Profile info
    recent_videos_data JSONB, -- Recent videos

    -- Metrics
    total_videos INTEGER,
    avg_views FLOAT,
    engagement_rate FLOAT,

    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON profile_data (username);
```

---

## 🔄 Data Flow

### 1. Regular Search (Fast Mode)

```
User Input → Backend
    ↓
Check Cache (DB)
    ↓ (if miss)
Apify API → TikTok Data
    ↓
Filter (views >= 5000)
    ↓
Return Results ✅
```

### 2. Deep Scan (Full Analysis)

```
User Input → Backend
    ↓
Apify API → Raw Data (50 videos)
    ↓
Filter (views >= 5000)
    ↓
Save to DB (Point A: initial_stats)
    ↓
ML Service → CLIP Embeddings ←─┐
    ↓                           │
Clustering (DBSCAN)             │
    ↓                           │
Return Results                  │
    ↓                           │
Schedule Rescan (2 min) ────────┘
    ↓
Rescan Task Runs
    ↓
Apify API → Fresh Data (Point B)
    ↓
Calculate Growth (B - A)
    ↓
UTS Score = f(growth, engagement)
    ↓
Update DB ✅
```

### 3. Visual Clustering

```
Trends with cover_url
    ↓
ML Service → CLIP Embeddings
    ↓
Backend → DBSCAN Clustering
    ↓
Assign cluster_id
    ↓
Similar videos grouped ✅
```

---

## 🧮 UTS Score Algorithm

**6-Layer Scoring System**:

```python
UTS = (L1 × 0.30) + (L2 × 0.20) + (L3 × 0.20) +
      (L4 × 0.15) + (L5 × 0.10) + (L7 × 0.05)

L1 = Viral Lift      = min(views / followers, 10) / 10
L2 = Velocity        = min((new_views - old_views) / old_views, 1)
L3 = Retention       = min((bookmarks / views) × 20, 1)
L4 = Cascade         = min(log₁₀(sound_usage + 1) / 2, 1)
L5 = Saturation      = max(1 - (total_usage / 1000), 0)
L7 = Stability       = min((shares + bookmarks) / views × 10, 1)

Final Score: UTS × 10  (range: 0-10)
```

---

## 📡 Inter-Service Communication

### Backend → ML Service

**HTTP REST API**:

```python
# Backend code
from services.ml_client import get_ml_client

ml_client = get_ml_client()

# Get embedding
embedding = ml_client.get_image_embedding(image_url)

# Batch processing
embeddings = ml_client.get_batch_image_embeddings(urls)

# AI summary
summary = ml_client.generate_trend_summary(desc, views)
```

**Error Handling**:
- Timeouts: 30 seconds
- Retries: None (fail fast)
- Fallback: Return None

---

## 🔐 Security

### Authentication
- JWT tokens (future feature)
- API keys in environment variables
- CORS configured per environment

### Data Protection
- HTTPS everywhere (enforced)
- Secrets in environment variables
- No sensitive data in logs

### Rate Limiting
- Cloudflare: Automatic DDoS protection
- Render: 512 MB RAM limit
- Railway: 8 GB RAM limit

---

## 📊 Performance

### Expected Response Times

| Operation | Time |
|-----------|------|
| Regular Search (cached) | < 100ms |
| Regular Search (new) | 5-10s |
| Deep Scan | 15-30s |
| Rescan (background) | 10-20s |
| ML Embedding | 100-500ms |
| AI Summary | 1-3s |

### Optimization Strategies

1. **Caching**: DB cache for search results (1 hour TTL)
2. **Batch Processing**: Multiple embeddings in single request
3. **Lazy Loading**: CLIP model loads on first use
4. **Background Jobs**: Auto-rescan via APScheduler
5. **CDN**: Static assets via Cloudflare

---

## 🚀 Scaling Strategy

### Horizontal Scaling

**Frontend**: Auto-scaled by Cloudflare
**Backend**: Manual scaling on Render (add instances)
**ML Service**: Manual scaling on Railway
**Database**: Supabase auto-scales

### Vertical Scaling

**Backend**: Upgrade to 2 GB RAM ($25/mo)
**ML Service**: Upgrade to 16 GB RAM ($20/mo)

### Future Optimizations

1. Redis cache for frequent queries
2. Celery for background tasks
3. Load balancer for ML Service
4. GPU instance for CLIP (faster embeddings)

---

## 📈 Monitoring

### Health Checks

- Frontend: Cloudflare automatic monitoring
- Backend: `GET /` endpoint
- ML Service: `GET /` endpoint
- Database: Supabase dashboard

### Logging

- **Frontend**: Browser console + Cloudflare Analytics
- **Backend**: stdout → Render Logs
- **ML Service**: stdout → Railway Logs

### Alerts

- Render: Email on service down
- Railway: Email on crashes
- Supabase: Email on high load

---

## 🔄 CI/CD

### Automatic Deployment

**Trigger**: Git push to `main` branch

**Cloudflare Pages**:
1. Detect push
2. Run `npm run build`
3. Deploy to CDN
4. Update DNS

**Render**:
1. Detect push
2. Pull latest code
3. `pip install -r requirements.txt`
4. Restart service

**Railway**:
1. Detect push
2. Pull latest code
3. `pip install -r requirements.txt`
4. Restart service

---

## 📝 Summary

✅ **3 independent microservices**
✅ **REST API communication**
✅ **Automatic scaling**
✅ **Production-ready**
✅ **Cost-effective** (~$12-15/mo)
✅ **Easy to maintain**

**Total Lines of Code**: ~5,000
**Services**: 3
**Endpoints**: 10+
**ML Models**: 2 (CLIP + Claude)
