import os
from groq import Groq
from dotenv import load_dotenv
from typing import Optional

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

SYSTEM_PROMPT = (
    "You are an expert AI research assistant specialized in academic literature. "
    "You help researchers understand papers, identify methodologies, synthesize findings, "
    "and generate novel research directions. Be concise, rigorous, and cite specifics when possible."
)


def chat_with_llm(message: str, paper_context: Optional[str] = None) -> str:
    try:
        messages = []

        system_content = SYSTEM_PROMPT
        if paper_context:
            system_content += (
                f"\n\nYou are currently discussing the following paper. "
                f"Reference it in your answers when relevant:\n\n{paper_context}"
            )

        messages.append({"role": "system", "content": system_content})
        messages.append({"role": "user", "content": message})

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error getting AI response: {str(e)}"
