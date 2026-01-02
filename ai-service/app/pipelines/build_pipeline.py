from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from app.clients.llm_client import get_llm
from app.prompts.templates import ANALYSIS_PROMPT, CHAT_PROMPT
from app.embeddings.vectorstore import get_vector_store
import os
from dotenv import load_dotenv

load_dotenv()

def get_gemini_llm():
    """Get Google Gemini LLM via LangChain"""
    api_key = os.getenv("GOOGLE_API_KEY")
    model_name = os.getenv("LLM_MODEL", "gemini-2.5-flash")
    
    if not api_key:
        return None
    
    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=api_key,
        temperature=0.7,
        convert_system_message_to_human=True
    )

def build_analysis_chain():
    """
    Build LangChain pipeline for resume analysis
    """
    llm = get_gemini_llm() or get_llm()
    
    if llm is None:
        return None
    
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
    llm = get_gemini_llm() or get_llm()
    
    if llm is None:
        return None
    
    prompt = PromptTemplate(
        template=CHAT_PROMPT,
        input_variables=["context", "message"]
    )
    
    chain = LLMChain(llm=llm, prompt=prompt)
    return chain

def build_rag_chain():
    """
    Build RAG (Retrieval Augmented Generation) chain for resume analysis
    Retrieves similar examples from knowledge base before generating response
    """
    llm = get_gemini_llm() or get_llm()
    
    if llm is None:
        return None
    
    # RAG prompt template with context from retrieval
    rag_prompt = PromptTemplate(
        input_variables=["context", "resume_text", "job_description", "question"],
        template="""You are an expert career advisor analyzing resumes. Use the following examples and best practices as reference:

REFERENCE EXAMPLES AND BEST PRACTICES:
{context}

Now analyze this specific case:

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

QUESTION/TASK:
{question}

Provide a detailed, personalized analysis based on the reference examples and best practices above. Be specific and actionable."""
    )
    
    chain = LLMChain(llm=llm, prompt=rag_prompt)
    return chain

def retrieve_relevant_context(query: str, collection_name: str = "career_knowledge", k: int = 3) -> str:
    """
    Retrieve relevant documents from vector store for RAG
    """
    try:
        vector_store = get_vector_store()
        results = vector_store.search(collection_name, query, k=k)
        
        if not results['documents']:
            return "No relevant examples found."
        
        # Format retrieved documents as context
        context_parts = []
        for i, (doc, meta) in enumerate(zip(results['documents'], results['metadatas'])):
            role = meta.get('role', 'Unknown')
            doc_type = meta.get('type', 'unknown')
            score = meta.get('score', 'N/A')
            
            context_parts.append(f"""
Example {i+1} - {role} ({doc_type}, Score: {score}):
{doc[:800]}...
""")
        
        return "\n".join(context_parts)
    
    except Exception as e:
        print(f"Error retrieving context: {e}")
        return "Unable to retrieve reference examples."

async def analyze_with_rag(resume_text: str, job_description: str, question: str = "Analyze this resume") -> str:
    """
    Analyze resume using RAG - retrieves similar examples then generates response
    """
    try:
        # Step 1: Retrieve relevant context
        search_query = f"{job_description[:500]}\n\nLooking for: resume analysis examples and best practices"
        context = retrieve_relevant_context(search_query, k=3)
        
        # Step 2: Generate response with context
        chain = build_rag_chain()
        if chain is None:
            return "LLM not available"
        
        result = await chain.arun(
            context=context,
            resume_text=resume_text[:2000],
            job_description=job_description[:2000],
            question=question
        )
        
        return result
    
    except Exception as e:
        print(f"RAG analysis error: {e}")
        # Fallback to non-RAG analysis
        chain = build_analysis_chain()
        if chain:
            return await chain.arun(resume_text=resume_text, job_description=job_description)
        return "Analysis failed"

def build_retriever():
    """
    Build retriever for vector store (used by RAG)
    """
    vector_store = get_vector_store()
    return vector_store

