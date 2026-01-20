"""
AI Service
Handles AI text generation using Anthropic Claude
"""
import os
from anthropic import Anthropic
from typing import Optional

# Global client for lazy loading
_claude_client = None


def get_claude_client():
    """Get or create Claude client"""
    global _claude_client

    if not _claude_client:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            print("⚠️ ANTHROPIC_API_KEY not found in environment")
            return None

        _claude_client = Anthropic(api_key=api_key)
        print("✅ Claude client initialized")

    return _claude_client


def generate_trend_summary(description: str, views: int, cover_url: Optional[str] = None) -> str:
    """
    Generate AI summary for a TikTok trend

    Args:
        description: Trend description
        views: Number of views
        cover_url: Optional cover image URL

    Returns:
        Short AI-generated summary
    """
    client = get_claude_client()

    if not client:
        return "AI Not Configured"

    prompt = f"""TikTok Trend Analysis:
Description: {description}
Views: {views:,}

Provide a very short (1-2 sentences) summary of what makes this trend viral. Focus on the key appeal factor."""

    try:
        response = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=100,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        )

        summary = response.content[0].text.strip()
        return summary

    except Exception as e:
        print(f"⚠️ AI summary error: {e}")
        return "Summary generation failed"


def generate_script(niche: str, tone: str, duration: int, hook: Optional[str] = None) -> str:
    """
    Generate TikTok script using AI

    Args:
        niche: Content niche (e.g., "fitness", "cooking")
        tone: Desired tone (e.g., "casual", "professional")
        duration: Video duration in seconds
        hook: Optional hook/opening line

    Returns:
        AI-generated script
    """
    client = get_claude_client()

    if not client:
        return "AI Not Configured"

    prompt = f"""Create a TikTok video script:
Niche: {niche}
Tone: {tone}
Duration: {duration} seconds
{f'Hook: {hook}' if hook else ''}

Generate a compelling script with:
1. Opening hook (first 3 seconds)
2. Main content
3. Call-to-action

Keep it concise and engaging."""

    try:
        response = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=500,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        )

        script = response.content[0].text.strip()
        return script

    except Exception as e:
        print(f"⚠️ Script generation error: {e}")
        return "Script generation failed"
