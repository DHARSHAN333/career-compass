from pydantic import BaseModel, Field
from typing import Optional, Dict, List

class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., description="Resume text content")
    job_description: str = Field(..., description="Job description text")
    
    class Config:
        json_schema_extra = {
            "example": {
                "resume_text": "Software Engineer with 5 years of experience...",
                "job_description": "Looking for a Senior Software Engineer..."
            }
        }

class ChatRequest(BaseModel):
    message: str = Field(..., description="User's chat message")
    context: Optional[Dict] = Field(default=None, description="Analysis context")
    history: Optional[List[Dict]] = Field(default_factory=list, description="Conversation history")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "How can I improve my resume?",
                "context": {
                    "resume_text": "...",
                    "job_description": "...",
                    "match_score": 75
                }
            }
        }

class ExtractRequest(BaseModel):
    file: str = Field(..., description="Base64 encoded file content")
    file_type: Optional[str] = Field(default="pdf", description="File type (pdf, docx, etc.)")
