"""
ML Service Client
Handles communication with the ML microservice
"""
import os
import requests
from typing import Optional, List


class MLServiceClient:
    """Client for ML Service API"""

    def __init__(self):
        self.base_url = os.getenv("ML_SERVICE_URL", "http://localhost:8001")
        self.timeout = 30

    def _make_request(self, method: str, endpoint: str, data: dict = None):
        """Make HTTP request to ML service"""
        url = f"{self.base_url}{endpoint}"
        try:
            if method == "GET":
                response = requests.get(url, timeout=self.timeout)
            elif method == "POST":
                response = requests.post(url, json=data, timeout=self.timeout)
            else:
                raise ValueError(f"Unsupported method: {method}")

            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"⚠️ ML Service request failed: {e}")
            return None

    def get_text_embedding(self, text: str) -> Optional[List[float]]:
        """
        Get CLIP embedding for text

        Args:
            text: Input text

        Returns:
            List of floats (embedding) or None if failed
        """
        result = self._make_request("POST", "/embeddings/text", {"text": text})
        if result and "embedding" in result:
            return result["embedding"]
        return None

    def get_image_embedding(self, image_url: str) -> Optional[List[float]]:
        """
        Get CLIP embedding for image

        Args:
            image_url: URL of the image

        Returns:
            List of floats (embedding) or None if failed
        """
        result = self._make_request("POST", "/embeddings/image", {"image_url": image_url})
        if result and "embedding" in result:
            return result["embedding"]
        return None

    def get_batch_image_embeddings(self, image_urls: List[str]) -> List[Optional[List[float]]]:
        """
        Get CLIP embeddings for multiple images

        Args:
            image_urls: List of image URLs

        Returns:
            List of embeddings (None for failed images)
        """
        result = self._make_request("POST", "/embeddings/batch-images", {"image_urls": image_urls})
        if result and "embeddings" in result:
            return result["embeddings"]
        return [None] * len(image_urls)

    def generate_trend_summary(self, description: str, views: int, cover_url: Optional[str] = None) -> str:
        """
        Generate AI summary for a trend

        Args:
            description: Trend description
            views: Number of views
            cover_url: Optional cover image URL

        Returns:
            AI-generated summary
        """
        data = {
            "description": description,
            "views": views
        }
        if cover_url:
            data["cover_url"] = cover_url

        result = self._make_request("POST", "/ai/trend-summary", data)
        if result and "summary" in result:
            return result["summary"]
        return "Summary not available"

    def health_check(self) -> bool:
        """
        Check if ML service is available

        Returns:
            True if service is healthy, False otherwise
        """
        result = self._make_request("GET", "/")
        return result is not None and result.get("status") == "ok"


# Singleton instance
_ml_client = None


def get_ml_client() -> MLServiceClient:
    """Get or create ML service client"""
    global _ml_client
    if _ml_client is None:
        _ml_client = MLServiceClient()
    return _ml_client
