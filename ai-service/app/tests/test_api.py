import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "status" in response.json()

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_analyze_endpoint():
    """Test analyze endpoint"""
    payload = {
        "resume_text": "Python developer with 5 years experience",
        "job_description": "Looking for Python developer"
    }
    response = client.post("/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "gaps" in data
    assert "tips" in data

def test_chat_endpoint():
    """Test chat endpoint"""
    payload = {
        "message": "How can I improve my Python skills?",
        "context": {
            "resume_text": "Python developer",
            "job_description": "Senior Python role"
        }
    }
    response = client.post("/v1/chat", json=payload)
    assert response.status_code == 200
    assert "response" in response.json()
