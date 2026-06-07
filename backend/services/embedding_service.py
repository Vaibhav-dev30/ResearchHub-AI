from fastembed import TextEmbedding

# Load model globally so it's loaded only once into memory
# fastembed automatically downloads and caches the model
model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

def get_embedding(text: str) -> list[float]:
    """
    Generates an embedding vector for a given text string.
    """
    # fastembed returns a generator, so we use next() to get the first (and only) result
    embedding = next(model.embed([text]))
    # Convert numpy array to list for database insertion
    return embedding.tolist()

def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generates embedding vectors for a list of text strings.
    """
    embeddings = list(model.embed(texts))
    return [e.tolist() for e in embeddings]
