import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

def summarize_text(text: str) -> str:
    prompt = """Analyze the following research paper text and provide:
1. A summary of 150-200 words.
2. The key findings extracted from the text.
3. 5 research questions generated from the text.
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an expert academic research assistant."},
                {"role": "user", "content": f"{prompt}\n\nText:\n{text}"}
            ],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error connecting to AI: {str(e)}"
