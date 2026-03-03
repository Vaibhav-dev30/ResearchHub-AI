import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

def extract_keywords(text: str) -> str:
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Extract exactly 10 keywords from the scientific text provided. Return them as a comma-separated list without any extra context or bold text. Only return the keywords separated by commas."},
                {"role": "user", "content": text}
            ],
            temperature=0.1,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error extracting keywords: {str(e)}"
