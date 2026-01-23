# backend/app/api/trends.py
import time
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, delete # ✅ Добавлена функция удаления
from typing import List, Optional
from pydantic import BaseModel, Field

from ..core.database import get_db
from ..db.models import Trend
from ..services.collector import TikTokCollector
from ..services.scorer import TrendScorer
from ..services.ml_client import get_ml_client
from ..services.clustering import cluster_trends_by_visuals 

# ИМПОРТ ПЛАНИРОВЩИКА
from ..services.scheduler import scheduler, rescan_videos_task

router = APIRouter()

class SearchRequest(BaseModel):
    target: Optional[str] = None         # Основной ввод (ключ или @username)
    keywords: Optional[List[str]] = []   # Для обратной совместимости
    mode: str = "keywords"               # "keywords" или "username"
    business_desc: Optional[str] = ""
    is_deep: Optional[bool] = False
    time_window: Optional[str] = None
    rescan_hours: int = Field(default=24, ge=1)

def trend_to_dict(trend: Trend) -> dict:
    return {
        "id": trend.id,
        "platform_id": trend.platform_id,
        "url": trend.url,
        "cover_url": trend.cover_url,
        "description": trend.description,
        "author_username": trend.author_username,
        "stats": trend.stats,
        "initial_stats": trend.initial_stats, 
        "uts_score": trend.uts_score,
        "cluster_id": trend.cluster_id,       
        "music_id": trend.music_id,
        "music_title": trend.music_title,
        "last_scanned_at": trend.last_scanned_at
    }

# --- ✅ ЭНДПОИНТ «ПРОЧИТАЛ И УДАЛИЛ» ---
@router.get("/results")
def get_saved_results(keyword: str, mode: str = "keywords", db: Session = Depends(get_db)):
    """
    Бесплатный поиск по базе данных. 
    Если данные уже прошли рескан (Точка Б), они удаляются сразу после выдачи.
    """
    print(f"📂 DB Buffer Read: ищем '{keyword}' в режиме '{mode}'")
    clean_nick = keyword.lower().strip().replace("@", "")
    
    if mode == "username":
        # СТРОГО: ищем видео, где этот юзер является автором
        query = db.query(Trend).filter(Trend.author_username.ilike(clean_nick))
    else:
        # ОБЫЧНЫЙ ПОИСК: по ключевым словам в разных полях
        search_term = f"%{keyword}%"
        query = db.query(Trend).filter(
            or_(Trend.description.ilike(search_term), Trend.vertical.ilike(search_term))
        )
    
    results = query.order_by(Trend.uts_score.desc()).all()
    data_to_return = [trend_to_dict(t) for t in results]

    # ✅ САМООЧИСТКА: Удаляем записи, если сверка уже завершена (есть дата последнего скана)
    ids_to_clean = [t.id for t in results if t.last_scanned_at is not None]
    
    if ids_to_clean:
        db.execute(delete(Trend).where(Trend.id.in_(ids_to_clean)))
        db.commit()
        print(f"🧹 БД Очищена: Удалено {len(ids_to_clean)} временных записей после выдачи.")

    return {"status": "ok", "items": data_to_return}

@router.post("/search")
def search_trends(req: SearchRequest, db: Session = Depends(get_db)):
    """Deep Scan + Auto Rescan Scheduler (Point A Setup)"""
    try:
        search_targets = [req.target] if req.target else req.keywords
        if not search_targets or not search_targets[0]:
            return {"status": "error", "message": "No query provided"}
    except Exception as e:
        print(f"❌ Error parsing request: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")

    print(f"🔎 API Search [{req.mode}]: {search_targets} (Deep: {req.is_deep})")
    
    collector = TikTokCollector()
    raw_items = []
    clean_items = []
    
    # 1. Для обычного поиска (не deep) - сначала проверяем кэш
    if not req.is_deep and req.mode != "username":
        limit = 20
        try:
            # Проверяем кэш в базе данных
            clean_nick = search_targets[0].lower().strip().replace("@", "")
            search_term = f"%{clean_nick}%"
            cached_results = db.query(Trend).filter(
                or_(Trend.description.ilike(search_term), Trend.vertical.ilike(search_term))
            ).order_by(Trend.uts_score.desc()).limit(limit).all()
        except Exception as e:
            print(f"❌ Error querying database cache: {e}")
            cached_results = []
        
        # Если есть свежие кэшированные данные (не старше 1 часа), используем их
        if cached_results:
            recent_cached = [t for t in cached_results 
                           if not t.last_scanned_at or 
                           (datetime.utcnow() - t.last_scanned_at) < timedelta(hours=1)]
            if recent_cached:
                print(f"💾 Используем кэшированные данные ({len(recent_cached)} записей) - НЕ запускаем Apify")
                return {"status": "ok", "items": [trend_to_dict(t) for t in recent_cached]}
        
        # Кэша нет - запускаем Apify
        print(f"🔄 Кэш не найден, запускаем Apify для поиска '{search_targets[0]}'...")
        raw_items = collector.collect(search_targets, limit=limit, mode="search", is_deep=False)
        
        if not raw_items:
            return {"status": "empty", "items": []}
        
        # Фильтруем результаты
        for item in raw_items:
            v_count = int(item.get("views") or (item.get("stats") or {}).get("playCount") or 0)
            if v_count >= 5000: clean_items.append(item)
    
    # 2. Для username или deep scan - всегда парсим
    elif req.mode == "username":
        limit = 20
        print(f"🔍 Парсинг профиля пользователя '{search_targets[0]}'...")
        raw_items = collector.collect(search_targets, limit=limit, mode="profile", is_deep=True)
        if not raw_items:
            return {"status": "empty", "items": []}
        clean_items = raw_items  # Для юзера берем всё без исключений
    
    elif req.is_deep:
        limit = 50
        print(f"🔬 Deep Scan для '{search_targets[0]}'...")
        raw_items = collector.collect(search_targets, limit=limit, mode="search", is_deep=req.is_deep)
        if not raw_items:
            return {"status": "empty", "items": []}
        # Для ключевых слов оставляем популярные
        for item in raw_items:
            v_count = int(item.get("views") or (item.get("stats") or {}).get("playCount") or 0)
            if v_count >= 5000: clean_items.append(item)

    # --- ✅ РЕЖИМ 1: ТРЕНДЫ (ОБЫЧНЫЙ ПОИСК БЕЗ DEEP SCAN) ---
    if not req.is_deep:
        # Для обычного поиска возвращаем результаты без сохранения в БД
        live_results = []
        for idx, item in enumerate(clean_items):
            # Debug: print first item structure
            if idx == 0:
                print(f"🔍 DEBUG: First item keys: {list(item.keys())}")
                print(f"🔍 DEBUG: play_addr sources: v_meta.playAddr={bool((item.get('video') or {}).get('playAddr'))}, item.playAddr={bool(item.get('playAddr'))}")
                print(f"🔍 DEBUG: URL: {item.get('webVideoUrl') or item.get('postPage') or item.get('url')}")

            # Пробуем разные варианты структуры данных от Apify
            v_meta = item.get("video") or item.get("videoMeta") or {}
            author_meta = item.get("author") or item.get("authorMeta") or item.get("channel") or {}
            stats = item.get("stats") or {}

            # Cover URL может быть в разных местах
            cover_url = (
                v_meta.get("cover") or
                v_meta.get("coverUrl") or
                v_meta.get("dynamicCover") or
                item.get("coverUrl") or
                item.get("cover") or
                item.get("videoCover") or
                ""
            ).replace(".heic", ".jpeg").replace(".webp", ".jpeg")

            # URL видео
            video_url = (
                item.get("webVideoUrl") or
                item.get("postPage") or
                item.get("url") or
                item.get("videoUrl") or
                f"https://www.tiktok.com/@{author_meta.get('uniqueId', 'user')}/video/{item.get('id', '')}"
            )

            # Прямая ссылка на видео файл для воспроизведения
            play_addr = (
                v_meta.get("playAddr") or
                v_meta.get("downloadAddr") or
                item.get("videoUrl") or
                item.get("playAddr") or
                ""
            )

            # Описание
            description = (
                item.get("text") or
                item.get("desc") or
                item.get("title") or
                item.get("description") or
                "No description"
            )

            # Username
            username = (
                author_meta.get("uniqueId") or
                author_meta.get("username") or
                item.get("authorName") or
                "unknown"
            )

            # Stats
            play_count = (
                stats.get("playCount") or
                stats.get("views") or
                item.get("views") or
                item.get("playCount") or
                0
            )

            digg_count = stats.get("diggCount") or stats.get("likes") or item.get("likes") or 0
            comment_count = stats.get("commentCount") or stats.get("comments") or item.get("comments") or 0
            share_count = stats.get("shareCount") or stats.get("shares") or item.get("shares") or 0

            # Hashtags
            hashtags = item.get("hashtags") or item.get("challenges") or []
            hashtags_list = []
            if isinstance(hashtags, list):
                for tag in hashtags[:5]:  # Limit to 5 hashtags
                    if isinstance(tag, dict):
                        hashtags_list.append({
                            "id": tag.get("id") or tag.get("name", ""),
                            "name": tag.get("title") or tag.get("name", ""),
                            "title": tag.get("title") or tag.get("name", ""),
                            "desc": tag.get("desc", ""),
                            "stats": {"videoCount": 0, "viewCount": 0}
                        })

            # Music info
            music_meta = item.get("music") or item.get("musicMeta") or {}
            music_info = None
            if music_meta:
                music_info = {
                    "id": str(music_meta.get("id", "")),
                    "title": music_meta.get("title") or music_meta.get("name", "Original Sound"),
                    "authorName": music_meta.get("authorName") or music_meta.get("author", username),
                    "original": music_meta.get("original", False),
                    "playUrl": music_meta.get("playUrl", "")
                }

            # Video duration
            duration = v_meta.get("duration") or item.get("duration") or 15000  # default 15 seconds

            # Author info
            author_info = {
                "id": str(author_meta.get("id", "")),
                "uniqueId": username,
                "nickname": author_meta.get("nickname") or author_meta.get("name") or username,
                "avatar": author_meta.get("avatarThumb") or author_meta.get("avatar", ""),
                "followerCount": author_meta.get("fans") or author_meta.get("followers", 0),
                "followingCount": author_meta.get("following", 0),
                "heartCount": author_meta.get("heart", 0),
                "videoCount": author_meta.get("video") or author_meta.get("videos", 0),
                "verified": author_meta.get("verified", False)
            }

            live_results.append({
                "id": str(item.get("id", "")),
                "title": description,
                "description": description,
                "url": video_url,
                "cover_url": cover_url,
                "author_username": username,
                "play_addr": play_addr,  # Прямая ссылка на видео
                "author": author_info,
                "stats": {
                    "playCount": int(play_count),
                    "diggCount": int(digg_count),
                    "commentCount": int(comment_count),
                    "shareCount": int(share_count)
                },
                "video": {
                    "duration": int(duration),
                    "ratio": "9:16",
                    "cover": cover_url,
                    "playAddr": play_addr,
                    "downloadAddr": play_addr
                },
                "music": music_info,
                "hashtags": hashtags_list,
                "createdAt": item.get("createTime") or item.get("createTimeISO", ""),
                "uts_score": 0,  # Will be calculated later if needed
                "viralScore": 0,
                "engagementRate": round((int(digg_count) + int(comment_count) + int(share_count)) / max(int(play_count), 1) * 100, 2) if play_count > 0 else 0
            })

        if len(live_results) > 0:
            print(f"✅ Parsed {len(live_results)} items. First cover_url: {live_results[0]['cover_url'][:50] if live_results[0]['cover_url'] else 'EMPTY'}")

        return {"status": "ok", "items": live_results}

    # --- ✅ РЕЖИМ 2: DEEP SCAN (ИСПОЛЬЗУЕМ ВРЕМЕННЫЙ БУФЕР БД) ---
    scorer = TrendScorer()
    processed_trends_objects = [] 
    cascade_total = len(clean_items)

    for item in clean_items:
        p_id = str(item.get("id"))
        video_url = item.get("postPage") or item.get("url") or item.get("webVideoUrl")
        views_now = int(item.get("views") or (item.get("stats") or {}).get("playCount") or 0)
        current_stats = {"playCount": views_now}

        existing_video = db.query(Trend).filter(or_(Trend.platform_id == p_id, Trend.url == video_url)).first()

        try:
            if existing_video:
                # ✅ Сброс Точки А при новом сканировании (храним временно для сверки)
                existing_video.initial_stats = current_stats 
                existing_video.stats = current_stats
                existing_video.last_scanned_at = None # Обнуляем, чтобы рескан поставил новую метку
                db.add(existing_video)
                processed_trends_objects.append(existing_video)
            else:
                # Создаем новую запись «буфера»
                new_trend = Trend(
                    platform_id=p_id, url=video_url, 
                    cover_url=(item.get("video", {}).get("coverUrl") or "").replace(".heic", ".jpeg"),
                    description=item.get("title") or "No desc",
                    stats=current_stats, initial_stats=current_stats,
                    author_username=(item.get("channel") or {}).get("username") or "unknown",
                    uts_score=0, vertical=search_targets[0] or "deep_scan",
                    last_scanned_at=None
                )
                db.add(new_trend)
                processed_trends_objects.append(new_trend)
            db.commit()
        except: db.rollback()

    # 3. КЛАСТЕРИЗАЦИЯ (Только для Deep Scan)
    if req.is_deep and processed_trends_objects:
        processed_trends_objects = cluster_trends_by_visuals(processed_trends_objects)
        for t in processed_trends_objects: db.add(t)
        try: db.commit()
        except: db.rollback()

    # 4. ПЛАНИРОВАНИЕ СВЕРКИ (2 МИНУТЫ ТЕСТ)
    if req.is_deep and processed_trends_objects:
        saved_urls = [t.url for t in processed_trends_objects if t.url]
        if saved_urls:
            run_date = datetime.now() + timedelta(minutes=2) 
            scheduler.add_job(
                rescan_videos_task, 'date', run_date=run_date, 
                args=[saved_urls, f"batch_{int(time.time())}"]
            )
            print(f"⏱️ ЗАДАЧА СВЕРКИ ОТПРАВЛЕНА: Запуск через 2 минуты.")

    return {"status": "ok", "items": [trend_to_dict(t) for t in processed_trends_objects]}