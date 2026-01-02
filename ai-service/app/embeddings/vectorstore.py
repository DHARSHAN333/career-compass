"""
Vector store wrapper for ChromaDB with RAG capabilities
"""
import os
from typing import List, Dict, Optional
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

class VectorStore:
    def __init__(self, store_type="chromadb", persist_directory=None):
        self.store_type = store_type
        self.client = None
        self.embedding_model = None
        self.persist_directory = persist_directory or os.getenv("VECTOR_STORE_PATH", "./data/vectorstore")
        self._initialize()
    
    def _initialize(self):
        """Initialize vector store client and embedding model"""
        if self.store_type == "chromadb":
            try:
                # Initialize ChromaDB with persistence (new API)
                self.client = chromadb.PersistentClient(path=self.persist_directory)
                print(f"✓ ChromaDB initialized at {self.persist_directory}")
                
                # Initialize local embedding model (free, no API key needed)
                self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
                print("✓ Sentence transformer model loaded")
                
            except Exception as e:
                print(f"ChromaDB initialization error: {e}")
                self.client = None
        elif self.store_type == "pinecone":
            # Placeholder for Pinecone implementation
            pass
    
    def get_or_create_collection(self, collection_name: str):
        """Get or create a collection"""
        if not self.client:
            raise Exception("Vector store not initialized")
        
        try:
            collection = self.client.get_collection(collection_name)
            print(f"✓ Using existing collection: {collection_name}")
        except:
            collection = self.client.create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            print(f"✓ Created new collection: {collection_name}")
        
        return collection
    
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for texts using local model"""
        if not self.embedding_model:
            raise Exception("Embedding model not initialized")
        
        embeddings = self.embedding_model.encode(texts, show_progress_bar=True)
        return embeddings.tolist()
    
    def embed_text(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        return self.embed_texts([text])[0]
    
    def add_documents(self, collection_name: str, documents: List[str], 
                     metadatas: Optional[List[Dict]] = None, 
                     ids: Optional[List[str]] = None):
        """Add documents with embeddings to vector store"""
        if not documents:
            return
        
        collection = self.get_or_create_collection(collection_name)
        
        # Generate embeddings
        print(f"Generating embeddings for {len(documents)} documents...")
        embeddings = self.embed_texts(documents)
        
        # Generate IDs if not provided
        if ids is None:
            existing_count = collection.count()
            ids = [f"doc_{existing_count + i}" for i in range(len(documents))]
        
        # Add to collection
        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        
        print(f"✓ Added {len(documents)} documents to {collection_name}")
    
    def search(self, collection_name: str, query: str, k: int = 5) -> Dict:
        """Search for similar documents"""
        if not self.client:
            return {"documents": [], "metadatas": [], "distances": []}
        
        try:
            collection = self.client.get_collection(collection_name)
            
            # Generate query embedding
            query_embedding = self.embed_text(query)
            
            # Search
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=k
            )
            
            return {
                "documents": results['documents'][0] if results['documents'] else [],
                "metadatas": results['metadatas'][0] if results['metadatas'] else [],
                "distances": results['distances'][0] if results['distances'] else [],
                "ids": results['ids'][0] if results['ids'] else []
            }
            
        except Exception as e:
            print(f"Search error: {e}")
            return {"documents": [], "metadatas": [], "distances": []}
    
    def delete_collection(self, collection_name: str):
        """Delete a collection"""
        if not self.client:
            return
        
        try:
            self.client.delete_collection(collection_name)
            print(f"✓ Deleted collection: {collection_name}")
        except Exception as e:
            print(f"Error deleting collection: {e}")
    
    def list_collections(self) -> List[str]:
        """List all collections"""
        if not self.client:
            return []
        
        try:
            collections = self.client.list_collections()
            return [col.name for col in collections]
        except Exception as e:
            print(f"Error listing collections: {e}")
            return []
    
    def get_collection_count(self, collection_name: str) -> int:
        """Get number of documents in collection"""
        try:
            collection = self.client.get_collection(collection_name)
            return collection.count()
        except:
            return 0

# Global instance
_vector_store = None

def get_vector_store() -> VectorStore:
    """Get or create global vector store instance"""
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store

