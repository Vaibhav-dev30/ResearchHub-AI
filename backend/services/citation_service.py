import requests

S2_API_URL = "https://api.semanticscholar.org/graph/v1/paper"

def get_citation_graph(arxiv_id: str) -> dict:
    """
    Fetches the paper details, its references, and citations from Semantic Scholar
    to build a graph representation for React Flow.
    """
    # Semantic Scholar allows querying by ArXiv ID directly if prefixed
    query_id = f"ARXIV:{arxiv_id}"
    
    fields = "paperId,title,authors,year,citations,citations.title,citations.authors,citations.year,references,references.title,references.authors,references.year"
    url = f"{S2_API_URL}/{query_id}?fields={fields}"
    
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        # Transform data into a node-edge format suitable for React Flow
        nodes = []
        edges = []
        
        # Add central node
        center_id = data.get("paperId", arxiv_id)
        nodes.append({
            "id": center_id,
            "data": {
                "label": data.get("title", "Unknown Title"),
                "authors": [a["name"] for a in data.get("authors", [])],
                "year": data.get("year", ""),
                "type": "center"
            }
        })
        
        # Process citations (papers that cite this paper)
        for cite in data.get("citations", [])[:15]:  # Limit to 15 to avoid massive graphs
            cite_id = cite.get("paperId")
            if not cite_id: continue
            
            nodes.append({
                "id": cite_id,
                "data": {
                    "label": cite.get("title", "Unknown"),
                    "authors": [a["name"] for a in cite.get("authors", [])] if cite.get("authors") else [],
                    "year": cite.get("year", ""),
                    "type": "citation"
                }
            })
            edges.append({
                "id": f"edge_{cite_id}_{center_id}",
                "source": cite_id,
                "target": center_id,
                "type": "citation"
            })
            
        # Process references (papers this paper cites)
        for ref in data.get("references", [])[:15]:
            ref_id = ref.get("paperId")
            if not ref_id: continue
            
            nodes.append({
                "id": ref_id,
                "data": {
                    "label": ref.get("title", "Unknown"),
                    "authors": [a["name"] for a in ref.get("authors", [])] if ref.get("authors") else [],
                    "year": ref.get("year", ""),
                    "type": "reference"
                }
            })
            edges.append({
                "id": f"edge_{center_id}_{ref_id}",
                "source": center_id,
                "target": ref_id,
                "type": "reference"
            })
            
        return {"nodes": nodes, "edges": edges}
        
    except requests.exceptions.RequestException as e:
        print(f"Semantic Scholar API error: {e}")
        return {"nodes": [], "edges": []}
