from sentence_transformers import SentenceTransformer

# Load model globally so it's loaded only once into memory
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text: str) -> list[float]:
    """
    Generates an embedding vector for a given text string.
    """
    embedding = model.encode(text)
    # Convert numpy array to list for database insertion
    return embedding.tolist()

def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generates embedding vectors for a list of text strings.
    """
    embeddings = model.encode(texts)
    return [e.tolist() for e in embeddings]
