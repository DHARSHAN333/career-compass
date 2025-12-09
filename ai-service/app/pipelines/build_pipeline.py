from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from app.clients.llm_client import get_llm
from app.prompts.templates import ANALYSIS_PROMPT, CHAT_PROMPT

def build_analysis_chain():
    """
    Build LangChain pipeline for resume analysis
    """
    llm = get_llm()
    prompt = PromptTemplate(
        template=ANALYSIS_PROMPT,
        input_variables=["resume_text", "job_description"]
    )
    
    chain = LLMChain(llm=llm, prompt=prompt)
    return chain

def build_chat_chain():
    """
    Build LangChain pipeline for chat interaction
    """
    llm = get_llm()
    prompt = PromptTemplate(
        template=CHAT_PROMPT,
        input_variables=["context", "message"]
    )
    
    chain = LLMChain(llm=llm, prompt=prompt)
    return chain

def build_retriever():
    """
    Build retriever for vector store (if using RAG)
    """
    # Placeholder for vector store retriever
    # Would integrate with ChromaDB or Pinecone
    pass
