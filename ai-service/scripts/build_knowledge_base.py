"""
Script to build the knowledge base vector store
Run this once to populate the vector database with sample data
"""
import sys
import os
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.embeddings.vectorstore import get_vector_store
from app.embeddings.knowledge_base import get_knowledge_base
from dotenv import load_dotenv

load_dotenv()

def build_knowledge_base():
    """Build the vector store from knowledge base documents"""
    print("=" * 60)
    print("Building Knowledge Base Vector Store")
    print("=" * 60)
    
    # Initialize
    vector_store = get_vector_store()
    knowledge_base = get_knowledge_base()
    
    # Load all documents
    print("\n[1/3] Loading documents from knowledge base...")
    documents = knowledge_base.get_all_documents()
    
    if not documents:
        print("❌ No documents found in knowledge base!")
        return
    
    # Prepare data for vector store
    print(f"\n[2/3] Processing {len(documents)} documents...")
    
    texts = [doc['content'] for doc in documents]
    metadatas = [
        {
            'role': doc.get('role', 'unknown'),
            'type': doc.get('type', 'unknown'),
            'filename': doc.get('filename', 'unknown'),
            'score': doc.get('score', 'N/A')
        }
        for doc in documents
    ]
    
    # Add to vector store
    print("\n[3/3] Adding documents to vector store...")
    collection_name = "career_knowledge"
    
    try:
        # Delete existing collection if it exists
        existing = vector_store.list_collections()
        if collection_name in existing:
            print(f"⚠ Deleting existing collection: {collection_name}")
            vector_store.delete_collection(collection_name)
        
        # Add documents
        vector_store.add_documents(
            collection_name=collection_name,
            documents=texts,
            metadatas=metadatas
        )
        
        # Verify
        count = vector_store.get_collection_count(collection_name)
        print(f"\n✅ Success! Vector store built with {count} documents")
        print(f"   Collection: {collection_name}")
        print(f"   Location: {vector_store.persist_directory}")
        
        # Test search
        print("\n[Test] Running sample search...")
        test_query = "Senior software engineer with Python experience"
        results = vector_store.search(collection_name, test_query, k=3)
        
        if results['documents']:
            print(f"✓ Found {len(results['documents'])} relevant documents:")
            for i, (doc, meta) in enumerate(zip(results['documents'][:3], results['metadatas'][:3])):
                print(f"\n  {i+1}. {meta.get('role', 'Unknown')} ({meta.get('type', 'unknown')})")
                print(f"     Preview: {doc[:150]}...")
        
    except Exception as e:
        print(f"\n❌ Error building vector store: {e}")
        import traceback
        traceback.print_exc()
        return
    
    print("\n" + "=" * 60)
    print("✅ Knowledge base is ready for RAG!")
    print("=" * 60)

if __name__ == "__main__":
    build_knowledge_base()
