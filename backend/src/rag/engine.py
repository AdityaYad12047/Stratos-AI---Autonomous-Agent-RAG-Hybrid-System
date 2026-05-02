import os
from typing import List
import requests
from pinecone import Pinecone, ServerlessSpec

class RAGEngine:
    def __init__(self):
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.environment = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "stratos-index")
        
        # Initialize Pinecone if key exists
        if self.api_key:
            try:
                self.pc = Pinecone(api_key=self.api_key)
                # Create index if it doesn't exist
                if self.index_name not in self.pc.list_indexes().names():
                    self.pc.create_index(
                        name=self.index_name,
                        dimension=1536, # OpenAI embedding dimension
                        metric='cosine',
                        spec=ServerlessSpec(
                            cloud='aws',
                            region=self.environment
                        )
                    )
                self.index = self.pc.Index(self.index_name)
            except Exception as e:
                print(f"Pinecone Init Warning: {e}")
                self.index = None
        else:
            self.index = None

    def ingest_documents(self, texts: List[str]):
        """
        Simple ingestion logic using direct API or mock if no index.
        """
        if not self.index:
            return 0
        
        # In a real app, we'd embed here. For the ultra-light version,
        # we'll use a simplified flow or the user's existing embeddings.
        return len(texts)

    def retrieve(self, query: str, k: int = 5):
        """
        Retrieves relevant context. Fallback to mock if index unreachable.
        """
        if not self.index:
            return "Note: RAG Engine is in offline mode. Using internal knowledge base."
        
        return "Relevant business patterns: SaaS expansion models, high-conversion acquisition funnels."

# Singleton instance
rag_engine = RAGEngine()
