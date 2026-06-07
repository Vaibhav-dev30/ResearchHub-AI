import fitz  # PyMuPDF
import re

def process_pdf(pdf_bytes: bytes, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """
    Extracts text from a PDF byte stream and splits it into overlapping chunks.
    """
    doc = fitz.open("pdf", pdf_bytes)
    full_text = ""

    # Extract text from all pages
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        full_text += text + "\n"

    # Basic cleanup: remove excessive newlines and spaces
    full_text = re.sub(r'\n\s*\n', '\n\n', full_text)
    full_text = re.sub(r' +', ' ', full_text)

    # Split into words for simple chunking
    words = full_text.split()
    chunks = []
    
    # Create overlapping chunks
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)

    return chunks
