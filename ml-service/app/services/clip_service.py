"""
CLIP Model Service
Handles text and image embeddings using OpenAI CLIP model
"""
import requests
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
from typing import Optional, List

# Global variables for lazy loading
_clip_model = None
_clip_processor = None


def load_clip():
    """Load CLIP model and processor (lazy loading)"""
    global _clip_model, _clip_processor

    if _clip_model is None:
        print("🧠 Loading CLIP model...")
        try:
            _clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            _clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

            # Move to GPU if available
            if torch.cuda.is_available():
                _clip_model = _clip_model.cuda()
                print("✅ CLIP loaded on GPU")
            else:
                print("✅ CLIP loaded on CPU")
        except Exception as e:
            print(f"⚠️ CLIP loading error: {e}")
            raise


def get_text_embedding(text: str) -> Optional[List[float]]:
    """
    Convert text to embedding vector (512 dimensions)

    Args:
        text: Input text string

    Returns:
        List of floats representing the embedding, or None if failed
    """
    load_clip()

    if not _clip_model or not text:
        return None

    try:
        inputs = _clip_processor(text=[text], return_tensors="pt", padding=True)

        # Move inputs to GPU if model is on GPU
        if torch.cuda.is_available():
            inputs = {k: v.cuda() for k, v in inputs.items()}

        with torch.no_grad():
            outputs = _clip_model.get_text_features(**inputs)

        embedding = outputs.squeeze().cpu().numpy().tolist()
        return embedding
    except Exception as e:
        print(f"⚠️ Text embedding error: {e}")
        return None


def get_image_embedding(image_url: str) -> Optional[List[float]]:
    """
    Download image and convert to embedding vector (512 dimensions)

    Args:
        image_url: URL of the image

    Returns:
        List of floats representing the embedding, or None if failed
    """
    load_clip()

    if not _clip_model or not image_url:
        return None

    try:
        # Download image
        response = requests.get(
            image_url,
            headers={"User-Agent": "Mozilla/5.0"},
            stream=True,
            timeout=10
        )

        if response.status_code != 200:
            print(f"⚠️ Failed to download image: {response.status_code}")
            return None

        # Open image
        image = Image.open(response.raw).convert("RGB")

        # Process image
        inputs = _clip_processor(images=image, return_tensors="pt")

        # Move inputs to GPU if model is on GPU
        if torch.cuda.is_available():
            inputs = {k: v.cuda() for k, v in inputs.items()}

        with torch.no_grad():
            outputs = _clip_model.get_image_features(**inputs)

        embedding = outputs.squeeze().cpu().numpy().tolist()
        return embedding
    except Exception as e:
        print(f"⚠️ Image embedding error for {image_url}: {e}")
        return None


def batch_image_embeddings(image_urls: List[str]) -> List[Optional[List[float]]]:
    """
    Generate embeddings for multiple images

    Args:
        image_urls: List of image URLs

    Returns:
        List of embeddings (None for failed images)
    """
    embeddings = []
    for url in image_urls:
        embedding = get_image_embedding(url)
        embeddings.append(embedding)

    return embeddings
