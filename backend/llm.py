"""Optional answer synthesis using Google Gemini's free-tier API.

Strictly grounded: the model is instructed to answer only from the retrieved
passages and to cite every claim. This matters a lot for religious source
material -- the goal is a summarizer over real text, not a model generating
hadith/verses from memory.
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
_model = genai.GenerativeModel(os.environ.get("GEMINI_MODEL", "gemini-3.6-flash"))

SYSTEM_PROMPT = """You are a research assistant over a corpus of Quran, Hadith, and classical \
tafsir. You will be given a user question and a set of retrieved passages, each labeled with \
a citation. Answer using ONLY the information in the retrieved passages.

Rules:
- Every claim must be followed by its citation, e.g. (Quran 2:255) or (Sahih al-Bukhari, Hadith 1).
- If the passages don't contain a clear answer, say so plainly instead of guessing.
- For hadith, mention the authenticity grade if it appears in the passage.
- Do not issue religious rulings (fatwas) of your own -- only summarize what the sources say.
- Keep the answer concise and neutral in tone.
"""


def synthesize(query: str, passages: list[dict]) -> str:
    context = "\n\n".join(f"[{p['citation']}]\n{p['text']}" for p in passages)
    prompt = f"{SYSTEM_PROMPT}\n\nQuestion: {query}\n\nRetrieved passages:\n{context}\n\nAnswer:"
    response = _model.generate_content(prompt)
    return response.text
