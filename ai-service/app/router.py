from fastapi import APIRouter, HTTPException
from app.schemas.requests import AnalyzeRequest, ChatRequest, ExtractRequest
from app.schemas.responses import (
    AnalyzeResponse, ChatResponse, ExtractResponse,
    SkillMatch, MissingSkill, Gap, Recommendation
)
from app.pipelines.scoring import calculate_match_score
from app.pipelines.gap_analysis import identify_gaps
from app.pipelines.tip_generator import generate_tips, generate_top_tip
from app.pipelines.extract_skills import extract_skills, find_matched_skills, find_missing_skills
from app.clients.llm_client import get_llm_response
import os

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume(request: AnalyzeRequest):
    """
    Analyze resume against job description
    """
    try:
        # Extract skills from both documents
        resume_skills = extract_skills(request.resume_text)
        jd_skills = extract_skills(request.job_description)
        
        # Find matched and missing skills
        matched = find_matched_skills(resume_skills, jd_skills)
        missing = find_missing_skills(resume_skills, jd_skills)
        
        # Calculate match score
        score = calculate_match_score(matched, jd_skills, request.resume_text, request.job_description)
        
        # Identify gaps
        gaps = identify_gaps(request.resume_text, request.job_description, missing)
        
        # Generate recommendations
        recommendations = generate_tips(request.resume_text, request.job_description, gaps, missing)
        
        # Generate top tip
        top_tip = generate_top_tip(score, gaps, missing)
        
        # Convert to response format
        matched_skills = [
            SkillMatch(name=skill, relevance=0.85 + (i * 0.03))
            for i, skill in enumerate(matched[:10])
        ]
        
        missing_skills = [
            MissingSkill(
                name=skill,
                priority="High" if i < 3 else "Medium",
                suggestion=f"Consider learning {skill} through online courses or hands-on projects"
            )
            for i, skill in enumerate(missing[:8])
        ]
        
        return AnalyzeResponse(
            match_score=score,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            gaps=gaps,
            recommendations=recommendations,
            top_tip=top_tip,
            model=os.getenv("LLM_MODEL", "gpt-3.5-turbo")
        )
    except Exception as e:
        print(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Handle chat queries about career advice
    """
    try:
        context = request.context or {}
        
        # Build context string
        context_parts = []
        if context.get('resume_text'):
            context_parts.append(f"Resume: {context['resume_text'][:500]}...")
        if context.get('job_description'):
            context_parts.append(f"Job Description: {context['job_description'][:500]}...")
        if context.get('match_score'):
            context_parts.append(f"Match Score: {context['match_score']}%")
        if context.get('gaps'):
            context_parts.append(f"Identified Gaps: {', '.join(context['gaps'][:5])}")
        
        context_str = "\n".join(context_parts) if context_parts else ""
        
        # Get LLM response
        response = await get_llm_response(request.message, context_str, request.history)
        
        return ChatResponse(
            response=response,
            model=os.getenv("LLM_MODEL", "gpt-3.5-turbo")
        )
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.post("/extract", response_model=ExtractResponse)
async def extract_text(request: ExtractRequest):
    """
    Extract text from resume file (PDF, DOCX, etc.)
    """
    try:
        # Placeholder for file extraction
        # Would implement using pypdf or python-docx
        text = "Text extraction not yet implemented. Please paste resume text directly."
        
        return ExtractResponse(text=text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
