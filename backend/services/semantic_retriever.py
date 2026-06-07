from sqlalchemy.orm import Session
from models import PaperChunk
from .embedding_service import get_embedding

def retrieve_relevant_chunks(db: Session, query: str, paper_id: int = None, limit: int = 5) -> list[str]:
    """
    Given a user query, generates an embedding and performs a cosine similarity
    search against the pgvector database to find the most relevant chunks.
    """
    query_embedding = get_embedding(query)
    
    # We use the <=> operator provided by pgvector for cosine distance
    db_query = db.query(PaperChunk)
    
    if paper_id is not None:
        db_query = db_query.filter(PaperChunk.paper_id == paper_id)
        
    results = db_query.order_by(PaperChunk.embedding.cosine_distance(query_embedding)).limit(limit).all()
    
    return [chunk.content for chunk in results]
