from pydantic import BaseModel, Field
from typing import List, Optional

class SkillMatch(BaseModel):
    name: str
    relevance: float = Field(ge=0.0, le=1.0)

class MissingSkill(BaseModel):
    name: str
    priority: str
    suggestion: str

class Gap(BaseModel):
    category: str
    description: str
    priority: str
    actionable: str

class Recommendation(BaseModel):
    text: str
    priority: str
    impact: str

class AnalyzeResponse(BaseModel):
    match_score: int = Field(..., ge=0, le=100, description="Match score (0-100)")
    matched_skills: List[SkillMatch] = Field(default_factory=list)
    missing_skills: List[MissingSkill] = Field(default_factory=list)
    gaps: List[Gap] = Field(default_factory=list)
    recommendations: List[Recommendation] = Field(default_factory=list)
    top_tip: str
    model: str = Field(default="gpt-3.5-turbo")

class ChatResponse(BaseModel):
    response: str = Field(..., description="AI-generated response")
    model: Optional[str] = "gpt-3.5-turbo"

class ExtractResponse(BaseModel):
    text: str = Field(..., description="Extracted text from file")
