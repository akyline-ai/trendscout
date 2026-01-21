# 🗄️ Neo4j Setup Guide for TrendScout AI

Руководство по настройке Neo4j для графовой базы данных трендов.

---

## 🎯 Зачем нужен Neo4j?

Neo4j идеально подходит для TrendScout AI для:

- 🕸️ **Связи между трендами** - hashtags, sounds, creators
- 🎵 **Music network** - какие звуки используются в трендах
- 👥 **Creator network** - кто с кем коллаборирует
- 📊 **Trend propagation** - как тренды распространяются
- 🔍 **Recommendations** - похожие тренды и создатели

---

## 🏆 Рекомендуемый вариант: Neo4j AuraDB

**Официальный cloud от Neo4j** - https://neo4j.com/cloud/aura/

### ✅ Преимущества

- ✅ **Free tier**: 50,000 nodes + 175,000 relationships (достаточно для старта)
- ✅ **Автоматические бэкапы**
- ✅ **Managed service** (не нужно настраивать)
- ✅ **Neo4j Browser** (визуализация графов)
- ✅ **Высокая доступность**
- ✅ **Автоматические обновления**

### 💰 Стоимость

| Tier | Цена | Nodes | Relationships |
|------|------|-------|---------------|
| Free | $0/мес | 50K | 175K |
| Professional | $65/мес | 200K | 1.4M |
| Enterprise | Custom | Unlimited | Unlimited |

**Для TrendScout**: Free tier достаточно для начала!

---

## 🚀 Быстрая настройка Neo4j AuraDB

### Шаг 1: Создание аккаунта

1. Зайдите на https://neo4j.com/cloud/aura/
2. Нажмите **Start Free**
3. Sign up (email или Google/GitHub)

### Шаг 2: Создание инстанса

1. **Create Instance** → **AuraDB Free**
2. Выберите регион (ближайший к вашим пользователям)
3. Название: `trendscout-graph`
4. Нажмите **Create**

### Шаг 3: Сохранение credentials

**ВАЖНО**: Credentials показываются только один раз!

```
Username: neo4j
Password: [сгенерированный пароль]
Connection URI: neo4j+s://xxxxx.databases.neo4j.io
```

**Сохраните это в безопасном месте!**

### Шаг 4: Connection String

```
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_generated_password
```

---

## 🔧 Альтернативные варианты

### 1. Railway + Neo4j (Self-hosted)

**Преимущества**:
- Больше контроля
- Можно кастомизировать

**Недостатки**:
- Нужно настраивать самостоятельно
- Дороже ($10-20/мес)
- Нужно делать бэкапы вручную

**Не рекомендуется** для начала, используйте AuraDB.

---

### 2. Render.com + Neo4j Docker

**Преимущества**:
- Дешевле Railway

**Недостатки**:
- Сложная настройка
- Persistence issues
- Медленный перезапуск

**Не рекомендуется**.

---

### 3. Local Neo4j (Development)

**Только для локальной разработки!**

```bash
# macOS
brew install neo4j
neo4j start

# Linux/Windows - через Docker
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -e NEO4J_AUTH=neo4j/test123 \
    neo4j:latest
```

**URL**: http://localhost:7474
**Bolt**: bolt://localhost:7687

---

## 🔌 Интеграция с TrendScout

### 1. Установка Python драйвера

Добавить в `server/requirements.txt`:

```txt
neo4j
```

### 2. Создание Neo4j Service

**Файл**: `server/app/services/neo4j_service.py`

```python
from neo4j import GraphDatabase
import os

class Neo4jService:
    def __init__(self):
        uri = os.getenv("NEO4J_URI")
        user = os.getenv("NEO4J_USER", "neo4j")
        password = os.getenv("NEO4J_PASSWORD")

        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def create_trend_node(self, trend_data):
        """Создать ноду тренда в графе"""
        with self.driver.session() as session:
            result = session.run(
                """
                CREATE (t:Trend {
                    platform_id: $platform_id,
                    url: $url,
                    description: $description,
                    uts_score: $uts_score
                })
                RETURN t
                """,
                platform_id=trend_data['platform_id'],
                url=trend_data['url'],
                description=trend_data['description'],
                uts_score=trend_data['uts_score']
            )
            return result.single()

    def create_sound_relationship(self, trend_id, sound_id, sound_title):
        """Связать тренд со звуком"""
        with self.driver.session() as session:
            session.run(
                """
                MATCH (t:Trend {platform_id: $trend_id})
                MERGE (s:Sound {sound_id: $sound_id})
                ON CREATE SET s.title = $sound_title
                MERGE (t)-[:USES_SOUND]->(s)
                """,
                trend_id=trend_id,
                sound_id=sound_id,
                sound_title=sound_title
            )

    def get_related_trends(self, trend_id, limit=10):
        """Найти похожие тренды через граф"""
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (t:Trend {platform_id: $trend_id})-[:USES_SOUND]->(s:Sound)
                      <-[:USES_SOUND]-(related:Trend)
                WHERE related.platform_id <> $trend_id
                RETURN related.platform_id, related.url, related.uts_score
                ORDER BY related.uts_score DESC
                LIMIT $limit
                """,
                trend_id=trend_id,
                limit=limit
            )
            return [record.data() for record in result]

# Singleton
_neo4j_service = None

def get_neo4j_service():
    global _neo4j_service
    if _neo4j_service is None:
        _neo4j_service = Neo4jService()
    return _neo4j_service
```

### 3. Обновить Environment Variables

**Файл**: `server/.env`

```env
# Existing variables...

# Neo4j Configuration
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_generated_password
```

**Файл**: `server/.env.example`

```env
# Neo4j Configuration (optional - for graph relationships)
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

### 4. Использование в API

**Обновить**: `server/app/api/trends.py`

```python
from ..services.neo4j_service import get_neo4j_service

@router.post("/search")
def search_trends(req: SearchRequest, db: Session = Depends(get_db)):
    # ... existing code ...

    # После сохранения в PostgreSQL, также сохраняем в Neo4j
    try:
        neo4j = get_neo4j_service()
        for trend in processed_trends_objects:
            # Создаем ноду тренда
            neo4j.create_trend_node({
                'platform_id': trend.platform_id,
                'url': trend.url,
                'description': trend.description,
                'uts_score': trend.uts_score
            })

            # Создаем связь со звуком
            if trend.music_id:
                neo4j.create_sound_relationship(
                    trend.platform_id,
                    trend.music_id,
                    trend.music_title
                )
    except Exception as e:
        print(f"⚠️ Neo4j sync failed: {e}")
        # Не останавливаем основной flow

    return {"status": "ok", "items": [trend_to_dict(t) for t in processed_trends_objects]}
```

---

## 📊 Примеры запросов Cypher

### 1. Найти популярные звуки

```cypher
MATCH (s:Sound)<-[:USES_SOUND]-(t:Trend)
RETURN s.title, count(t) as usage_count, avg(t.uts_score) as avg_score
ORDER BY usage_count DESC
LIMIT 10
```

### 2. Найти похожие тренды

```cypher
MATCH (t1:Trend {platform_id: "123"})-[:USES_SOUND]->(s:Sound)
      <-[:USES_SOUND]-(t2:Trend)
WHERE t1 <> t2
RETURN t2.platform_id, t2.url, t2.uts_score
ORDER BY t2.uts_score DESC
LIMIT 5
```

### 3. Найти trending sounds

```cypher
MATCH (s:Sound)<-[r:USES_SOUND]-(t:Trend)
WHERE t.uts_score > 7.0
RETURN s.sound_id, s.title, count(r) as viral_usage
ORDER BY viral_usage DESC
LIMIT 20
```

### 4. Creator network

```cypher
MATCH (c:Creator)-[:CREATED]->(t:Trend)-[:USES_SOUND]->(s:Sound)
      <-[:USES_SOUND]-(t2:Trend)<-[:CREATED]-(c2:Creator)
WHERE c <> c2
RETURN c.username, c2.username, count(s) as shared_sounds
ORDER BY shared_sounds DESC
LIMIT 10
```

---

## 🎨 Graph Data Model

```
(Trend) -- USES_SOUND --> (Sound)
(Trend) -- USES_HASHTAG --> (Hashtag)
(Creator) -- CREATED --> (Trend)
(Creator) -- FOLLOWS --> (Creator)
(Trend) -- SIMILAR_TO --> (Trend)
(Trend) -- IN_CLUSTER --> (Cluster)
```

### Node Properties

**Trend**:
- platform_id (unique)
- url
- description
- uts_score
- created_at

**Sound**:
- sound_id (unique)
- title
- usage_count

**Hashtag**:
- name (unique)
- usage_count

**Creator**:
- username (unique)
- followers
- avg_uts_score

---

## 🔍 Use Cases

### 1. Music Discovery
"Какие звуки используют top-10 трендов?"

### 2. Trend Prediction
"Если этот звук viral, какие другие тренды с ним взлетят?"

### 3. Creator Recommendations
"Кто создает похожий контент?"

### 4. Hashtag Strategy
"Какие hashtags часто встречаются вместе?"

### 5. Cluster Analysis
"Какие визуальные группы связаны через звуки?"

---

## 📊 Production Setup

### Environment Variables (Render)

```env
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=xxxxx
```

### Health Check

```python
@app.get("/health")
def health_check():
    neo4j_status = "ok"
    try:
        neo4j = get_neo4j_service()
        with neo4j.driver.session() as session:
            session.run("RETURN 1")
    except:
        neo4j_status = "failed"

    return {
        "status": "ok",
        "neo4j": neo4j_status
    }
```

---

## 💰 Стоимость с Neo4j

| Сервис | Платформа | Стоимость |
|--------|-----------|-----------|
| Frontend | Cloudflare Pages | Free |
| Backend | Render.com | $7/мес |
| ML Service | Railway.app | $5/мес |
| PostgreSQL | Supabase | Free |
| **Neo4j** | **AuraDB Free** | **$0/мес** |
| **Total** | | **$12/мес** |

**Neo4j не увеличивает стоимость!** 🎉

---

## ⚠️ Важные заметки

### 1. Optional Feature

Neo4j - **опциональная** фича. Основное приложение работает без него.

### 2. Graceful Degradation

Если Neo4j недоступен, приложение продолжает работать:

```python
try:
    neo4j.create_trend_node(data)
except:
    # Log error but don't fail
    print("Neo4j sync failed, continuing...")
```

### 3. Async Sync

Можно синхронизировать в фоне через APScheduler:

```python
@scheduler.scheduled_job('interval', hours=1)
def sync_to_neo4j():
    # Sync PostgreSQL → Neo4j
    pass
```

---

## ✅ Deployment Checklist

- [ ] Neo4j AuraDB инстанс создан
- [ ] Credentials сохранены в безопасном месте
- [ ] `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` добавлены в Render
- [ ] Python драйвер `neo4j` добавлен в requirements.txt
- [ ] `neo4j_service.py` создан
- [ ] Health check работает
- [ ] Тестовый запрос выполнен успешно

---

## 🎉 Итоги

**Рекомендация**:

✅ **Neo4j AuraDB Free Tier**
- Бесплатно
- Managed service
- 50K nodes (достаточно для старта)
- Автоматические бэкапы
- Neo4j Browser для визуализации

**Альтернативы**:
- ❌ Railway (дорого, сложно)
- ❌ Render Docker (неудобно)
- ✅ Local Neo4j (только для development)

**Next steps**:
1. Создайте AuraDB Free инстанс
2. Сохраните credentials
3. Добавьте в server/.env
4. Создайте neo4j_service.py
5. Интегрируйте в API endpoints

---

**Обновлено**: 2026-01-20
**Status**: ✅ Ready to implement
