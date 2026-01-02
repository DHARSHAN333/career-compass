"""
Test RAG implementation
Run this to verify RAG is working correctly
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import asyncio
from app.embeddings.vectorstore import get_vector_store
from app.embeddings.knowledge_base import get_knowledge_base
from app.pipelines.build_pipeline import retrieve_relevant_context, analyze_with_rag
from dotenv import load_dotenv

load_dotenv()

async def test_rag_system():
    """Test the RAG implementation"""
    print("=" * 70)
    print("RAG SYSTEM TEST")
    print("=" * 70)
    
    # Test 1: Vector Store
    print("\n[TEST 1] Vector Store Initialization")
    print("-" * 70)
    try:
        vector_store = get_vector_store()
        collections = vector_store.list_collections()
        print(f"✓ Vector store initialized")
        print(f"  Collections: {collections}")
        
        if "career_knowledge" in collections:
            count = vector_store.get_collection_count("career_knowledge")
            print(f"  Documents in 'career_knowledge': {count}")
        else:
            print("  ⚠ 'career_knowledge' collection not found")
            print("  Run: python scripts/build_knowledge_base.py")
            return
    except Exception as e:
        print(f"✗ Vector store error: {e}")
        return
    
    # Test 2: Knowledge Base
    print("\n[TEST 2] Knowledge Base Loading")
    print("-" * 70)
    try:
        kb = get_knowledge_base()
        resumes = kb.load_sample_resumes()
        jobs = kb.load_job_templates()
        tips = kb.load_best_practices()
        
        print(f"✓ Sample resumes: {len(resumes)}")
        print(f"✓ Job templates: {len(jobs)}")
        print(f"✓ Best practices loaded: {len(tips)} categories")
    except Exception as e:
        print(f"✗ Knowledge base error: {e}")
        return
    
    # Test 3: Retrieval
    print("\n[TEST 3] Document Retrieval")
    print("-" * 70)
    try:
        test_query = "Senior software engineer with Python and AWS experience"
        print(f"Query: '{test_query}'")
        
        context = retrieve_relevant_context(test_query, k=2)
        print(f"\n✓ Retrieved context ({len(context)} chars):")
        print(context[:500] + "...\n")
    except Exception as e:
        print(f"✗ Retrieval error: {e}")
        return
    
    # Test 4: RAG Analysis
    print("\n[TEST 4] RAG-Enhanced Analysis")
    print("-" * 70)
    try:
        sample_resume = """
        John Doe
        Software Engineer with 3 years experience in Python and React.
        Built web applications using Django and PostgreSQL.
        """
        
        sample_jd = """
        Looking for Senior Software Engineer with 5+ years experience.
        Required: Python, AWS, Docker, Kubernetes, Microservices
        """
        
        print("Analyzing sample resume with RAG...")
        result = await analyze_with_rag(
            sample_resume,
            sample_jd,
            "What are the key gaps and how can the candidate improve?"
        )
        
        print(f"\n✓ RAG Analysis Result:")
        print(result[:600] + "..." if len(result) > 600 else result)
        
    except Exception as e:
        print(f"✗ RAG analysis error: {e}")
        import traceback
        traceback.print_exc()
        return
    
    print("\n" + "=" * 70)
    print("✅ ALL TESTS PASSED - RAG SYSTEM IS WORKING!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_rag_system())
