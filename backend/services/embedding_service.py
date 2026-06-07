import os
import requests
from fastapi import HTTPException

# We use the free HuggingFace Inference API to avoid OOM limits on Render
API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"

def _get_headers():
    hf_token = os.getenv("HF_TOKEN")
    if not hf_token:
        raise HTTPException(status_code=500, detail="HF_TOKEN environment variable is not set. Please add your HuggingFace API token in Render.")
    return {"Authorization": f"Bearer {hf_token}"}

def get_embedding(text: str) -> list[float]:
    """
    Generates an embedding vector for a given text string using HF API.
    """
    response = requests.post(API_URL, headers=_get_headers(), json={"inputs": [text]})
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"HuggingFace API error: {response.text}")
    # The API returns a list of lists, we want the first one
    return response.json()[0]

def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generates embedding vectors for a list of text strings using HF API.
    """
    response = requests.post(API_URL, headers=_get_headers(), json={"inputs": texts})
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"HuggingFace API error: {response.text}")
    return response.json()
