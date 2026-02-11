# backend/app/api/proxy.py
"""
Image Proxy API - Bypasses CORS and geo-restrictions for TikTok CDN images.

For geo-restricted URLs (EU/Asia CDN like tiktokcdn-eu.com), uses Apify residential proxy.
For US CDN URLs, uses direct connection (faster).
"""
import os
import random
import time
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import httpx
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Get Apify credentials
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")
APIFY_PROXY_PASSWORD = os.getenv("APIFY_PROXY_PASSWORD") or APIFY_API_TOKEN


def is_geo_restricted_url(url: str) -> bool:
    """
    Check if URL is from geo-restricted TikTok CDN (EU/Asia).

    Kazakhstan and Asian accounts use EU/Asia CDN domains that are geo-blocked.
    """
    return "tiktokcdn-eu.com" in url or "tos-alisg" in url or "-common.tiktokcdn" in url


def is_allowed_domain(url: str) -> bool:
    """
    Whitelist: only allow TikTok/Instagram CDN domains.
    Prevents SSRF attacks (accessing internal services, AWS metadata, etc).
    """
    ALLOWED_DOMAINS = [
        "tiktokcdn.com",
        "tiktokcdn-us.com",
        "tiktokcdn-eu.com",
        "tiktokcdn-in.com",
        "tiktok.com",
        "musical.ly",
        "ibytedtos.com",
        "ipstatp.com",
        "ibyteimg.com",
        "cdninstagram.com",
        "fbcdn.net",
        "supabase.co",
    ]
    return any(domain in url for domain in ALLOWED_DOMAINS)


@router.get("/image")
async def proxy_image(url: str):
    """
    Проксирует изображения с TikTok CDN для обхода CORS и гео-ограничений.

    Для гео-ограниченных URL (EU/Asia CDN) использует Apify residential proxy.
    Для US CDN URL использует прямое подключение (быстрее).
    """
    if not url or not url.startswith("https://"):
        raise HTTPException(status_code=400, detail="Invalid URL")

    if not is_allowed_domain(url):
        logger.warning(f"🚫 Blocked proxy request to non-whitelisted domain: {url[:80]}")
        raise HTTPException(status_code=403, detail="Domain not allowed")

    try:
        # Generate a realistic tt_webid_v2 cookie (TikTok requires this)
        tt_webid = f"{int(time.time() * 1000)}{random.randint(100000000, 999999999)}"

        # Extended headers to bypass TikTok CDN restrictions
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Referer": "https://www.tiktok.com/",
            "Origin": "https://www.tiktok.com",
            "Cookie": f"tt_webid_v2={tt_webid}; tt_csrf_token=abc123",
            "Sec-Fetch-Dest": "image",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "cross-site",
            "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
        }

        # Check if URL needs Apify residential proxy (geo-restricted)
        use_apify_proxy = is_geo_restricted_url(url) and APIFY_API_TOKEN

        if use_apify_proxy:
            # Use residential proxies for geo-restricted URLs (Kazakhstan, Singapore storage)
            # Pay-as-you-go: $12.50/GB for residential IPs
            # This is required because TikTok blocks datacenter IPs for tos-alisg storage
            proxy_url = f"http://groups-RESIDENTIAL:{APIFY_PROXY_PASSWORD}@proxy.apify.com:8000"
            logger.info(f"📥 Proxying geo-restricted image via Apify RESIDENTIAL: {url[:80]}...")

            async with httpx.AsyncClient(
                timeout=30.0,  # Longer timeout for proxy
                follow_redirects=True,
                verify=False,
                proxy=proxy_url  # httpx uses 'proxy' not 'proxies'
            ) as client:
                response = await client.get(url, headers=headers)
        else:
            # Direct connection for US CDN (faster, no proxy needed)
            logger.info(f"📥 Proxying image (direct): {url[:80]}...")

            async with httpx.AsyncClient(
                timeout=15.0,
                follow_redirects=True,
                verify=False
            ) as client:
                response = await client.get(url, headers=headers)

        if response.status_code == 200:
            return Response(
                content=response.content,
                media_type=response.headers.get("content-type", "image/jpeg"),
                headers={
                    "Cache-Control": "public, max-age=86400",  # 24 hours
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET",
                }
            )
        else:
            logger.error(f"❌ Proxy failed: {response.status_code} for {url[:80]}")
            raise HTTPException(status_code=response.status_code, detail="Image not available")

    except httpx.TimeoutException:
        logger.error(f"❌ Proxy timeout for {url[:80]}")
        raise HTTPException(status_code=504, detail="Image fetch timeout")
    except Exception as e:
        logger.error(f"❌ Proxy error for {url[:80]}: {str(e)}")
        raise HTTPException(status_code=500, detail="Image proxy failed")
