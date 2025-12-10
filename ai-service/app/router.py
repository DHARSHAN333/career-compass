from fastapi import APIRouter, HTTPException, UploadFile, File, Form
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
from app.utils.text_extractor import TextExtractor
import os
from typing import Optional

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
    Handle chat queries about career advice with full resume context
    """
    try:
        context = request.context or {}
        
        # Debug logging (without emojis to prevent encoding errors)
        print(f"\n[Chat] Request received:")
        print(f"   Message: {request.message}")
        print(f"   Has resumeText: {bool(context.get('resumeText') or context.get('resume_text'))}")
        print(f"   Match Score: {context.get('matchScore') or context.get('match_score')}")
        print(f"   Skills: {context.get('skills')}")
        
        # Build comprehensive context string with full resume details
        context_parts = []
        
        # Include full resume text (not truncated) for accurate responses
        if context.get('resumeText') or context.get('resume_text'):
            resume_text = context.get('resumeText') or context.get('resume_text')
            context_parts.append(f"CANDIDATE'S RESUME:\n{resume_text}\n")
        
        # Include full job description
        if context.get('jobDescription') or context.get('job_description'):
            job_desc = context.get('jobDescription') or context.get('job_description')
            context_parts.append(f"TARGET JOB DESCRIPTION:\n{job_desc}\n")
        
        # Include analysis results
        if context.get('matchScore') or context.get('match_score'):
            score = context.get('matchScore') or context.get('match_score')
            context_parts.append(f"MATCH SCORE: {score}%")
        
        # Include matched skills
        if context.get('skills', {}).get('matched'):
            matched = ', '.join([str(s) if isinstance(s, str) else s.get('name', str(s)) 
                               for s in context['skills']['matched'][:10]])
            context_parts.append(f"MATCHED SKILLS: {matched}")
        
        # Include missing skills (gaps)
        if context.get('skills', {}).get('missing'):
            missing = ', '.join([str(s) if isinstance(s, str) else s.get('name', str(s)) 
                               for s in context['skills']['missing'][:10]])
            context_parts.append(f"MISSING SKILLS: {missing}")
        
        # Include gaps from analysis
        if context.get('gaps'):
            gaps_list = [str(g) if isinstance(g, str) else g.get('description', str(g)) 
                        for g in context['gaps'][:5]]
            context_parts.append(f"IDENTIFIED GAPS: {', '.join(gaps_list)}")
        
        # Include recommendations
        if context.get('recommendations'):
            recs = [str(r) if isinstance(r, str) else r.get('text', str(r)) 
                   for r in context['recommendations'][:3]]
            context_parts.append(f"KEY RECOMMENDATIONS: {'; '.join(recs)}")
        
        context_str = "\n".join(context_parts) if context_parts else ""
        
        # Enhanced system prompt for context-aware responses
        system_prompt = """You are an expert career advisor and resume consultant. You have access to the candidate's full resume, 
the job description they're applying for, and detailed analysis results. 

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE:
1. ALWAYS START by referencing something SPECIFIC from their resume (company name, role, project, skill, year)
2. NEVER give generic advice - every response must be personalized to THIS candidate
3. Quote or paraphrase actual text from their resume when relevant
4. If asked about skills, list the EXACT skills from their MATCHED SKILLS list
5. If asked about gaps, mention the EXACT missing skills from the analysis
6. If you see experience like "5 years at Company X", reference it by name
7. Format responses clearly with bullet points when listing multiple items
8. Keep responses 2-4 paragraphs, conversational but professional

EXAMPLES OF GOOD RESPONSES:
- "Based on your 5 years of Python experience and your work with Django at [Company], you're well-positioned..."
- "I see you have React, Node.js, and AWS in your skillset. Your strongest matches are: [list actual matched skills]"
- "Looking at your resume, you're missing: Kubernetes and Docker. I recommend..."

EXAMPLES OF BAD RESPONSES (NEVER DO THIS):
- "You should focus on high-priority gaps" (too generic - which gaps?)
- "Consider learning cloud technologies" (be specific - which ones are missing?)
- "Build projects to demonstrate skills" (which skills? from where in their resume?)

Context Information:
{context}

User Question: {message}

Remember: BE SPECIFIC. Reference their actual resume content in your response."""
        
        formatted_prompt = system_prompt.format(context=context_str, message=request.message)
        
        # Get LLM response with enhanced context
        response = await get_llm_response(formatted_prompt, "", request.history)
        
        return ChatResponse(
            response=response,
            model=os.getenv("LLM_MODEL", "gpt-3.5-turbo")
        )
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.post("/extract", response_model=ExtractResponse)
async def extract_text(file: UploadFile = File(...)):
    """
    Extract text from uploaded resume file (PDF, DOCX, images)
    """
    try:
        # Read file content
        file_content = await file.read()
        filename = file.filename
        
        # Extract text using appropriate method
        extractor = TextExtractor()
        extracted_text = extractor.extract_text(file_content, filename)
        
        if not extracted_text or len(extracted_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract sufficient text from the file. Please ensure the file contains readable text."
            )
        
        return ExtractResponse(text=extracted_text)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Extract error: {e}")
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

@router.post("/extract-base64", response_model=ExtractResponse)
async def extract_text_from_base64(request: ExtractRequest):
    """
    Extract text from base64 encoded file
    """
    try:
        extractor = TextExtractor()
        extracted_text = extractor.extract_from_base64(
            request.file_content,
            request.file_type
        )
        
        if not extracted_text or len(extracted_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract sufficient text from the file"
            )
        
        return ExtractResponse(text=extracted_text)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Base64 extract error: {e}")
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")
