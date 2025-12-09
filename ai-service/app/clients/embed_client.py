from langchain.embeddings import OpenAIEmbeddings
import os
from dotenv import load_dotenv

load_dotenv()

def get_embeddings():
    """
    Get OpenAI embeddings instance
    """
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
    
    if not api_key:
        raise ValueError("OPENAI_API_KEY not set in environment")
    
    return OpenAIEmbeddings(
        model=model,
        openai_api_key=api_key
    )

async def embed_text(text: str) -> list:
    """
    Generate embedding for text
    """
    embeddings = get_embeddings()
    return await embeddings.aembed_query(text)

async def embed_documents(texts: list) -> list:
    """
    Generate embeddings for multiple documents
    """
    embeddings = get_embeddings()
    return await embeddings.aembed_documents(texts)
