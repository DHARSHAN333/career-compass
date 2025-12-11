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
import re
from typing import Optional

router = APIRouter()

# Helper functions for enhanced AI analysis
async def analyze_gaps_with_ai(resume_text, job_description, missing_skills, matched_skills, detail_level):
    """Use AI to identify detailed gaps between resume and job requirements"""
    try:
        prompt = f"""Analyze the gap between this candidate's resume and the job requirements.

RESUME:
{resume_text[:2000]}

JOB DESCRIPTION:
{job_description[:2000]}

MATCHED SKILLS: {', '.join(matched_skills[:10])}
MISSING SKILLS: {', '.join(missing_skills[:10])}

Identify 3-5 specific gaps. For each gap, provide:
1. Category (e.g., "Technical Skills", "Experience", "Certifications")
2. Detailed description of what's missing
3. Impact level (High/Medium/Low)

Format as:
Category | Description | Impact
"""
        
        response = await get_llm_response(prompt, "")
        
        # Parse AI response into structured gaps
        gaps = []
        lines = response.split('\n')
        for line in lines:
            if '|' in line and not line.startswith('Category'):
                parts = [p.strip() for p in line.split('|')]
                if len(parts) >= 3:
                    gaps.append(Gap(
                        category=parts[0],
                        description=parts[1],
                        impact=parts[2]
                    ))
        
        # Fallback to traditional gap analysis if AI parsing fails
        if not gaps:
            gaps = identify_gaps(resume_text, job_description, missing_skills)
        
        return gaps[:5]
    except Exception as e:
        print(f"AI gap analysis failed: {e}")
        return identify_gaps(resume_text, job_description, missing_skills)

async def generate_recommendations_with_ai(resume_text, job_description, gaps, missing_skills, matched_skills, score, detail_level, include_examples):
    """Generate personalized recommendations using AI"""
    try:
        example_text = " with specific examples" if include_examples else ""
        
        prompt = f"""Generate {5 if detail_level == 'comprehensive' else 4 if detail_level == 'detailed' else 3} actionable recommendations to improve this resume for the job.

CURRENT MATCH SCORE: {score}%
MATCHED SKILLS: {', '.join(matched_skills[:8])}
MISSING SKILLS: {', '.join(missing_skills[:8])}

Top Gaps:
{chr(10).join([f"- {g.description}" for g in gaps[:3]])}

Provide specific, actionable recommendations{example_text}. Each recommendation should:
1. Be clear and implementable
2. Target the most critical gaps
3. Include concrete actions{' with examples' if include_examples else ''}

Format each as a single actionable sentence."""
        
        response = await get_llm_response(prompt, "")
        
        # Parse recommendations
        recommendations = []
        lines = [l.strip() for l in response.split('\n') if l.strip()]
        for line in lines:
            # Remove numbering and bullet points
            text = re.sub(r'^[\d\.\-\*\)]+\s*', '', line).strip()
            if text and len(text) > 20:
                recommendations.append(Recommendation(text=text))
        
        # Fallback
        if not recommendations:
            recommendations = generate_tips(resume_text, job_description, gaps, missing_skills)
        
        return recommendations[:6]
    except Exception as e:
        print(f"AI recommendations failed: {e}")
        return generate_tips(resume_text, job_description, gaps, missing_skills)

async def generate_personalized_tip(score, gaps, missing_skills, matched_skills, priority_focus):
    """Generate a personalized top tip based on priority focus"""
    try:
        focus_context = {
            'skills': 'Focus on technical skills and competencies',
            'experience': 'Focus on years of experience and past roles',
            'balanced': 'Balance between skills, experience, and presentation',
            'keywords': 'Focus on keywords and ATS optimization'
        }.get(priority_focus, 'Provide balanced advice')
        
        prompt = f"""Generate ONE concise, actionable tip (1-2 sentences) for this candidate.

CONTEXT:
- Match Score: {score}%
- Matched Skills: {len(matched_skills)}
- Missing Skills: {len(missing_skills)}
- Top Missing: {', '.join(missing_skills[:3])}
- Priority: {focus_context}

Provide the SINGLE MOST IMPORTANT action they should take next. Be specific and actionable."""
        
        tip = await get_llm_response(prompt, "")
        return tip.strip() if tip else generate_top_tip(score, gaps, missing_skills)
    except Exception as e:
        print(f"AI tip generation failed: {e}")
        return generate_top_tip(score, gaps, missing_skills)

def calculate_skill_relevance(skill, job_description, base_score):
    """Calculate how relevant a skill is to the job"""
    jd_lower = job_description.lower()
    skill_lower = skill.lower()
    
    # Count occurrences
    occurrences = jd_lower.count(skill_lower)
    
    # Check if in title or early in description
    first_200 = jd_lower[:200]
    in_title = skill_lower in first_200
    
    relevance = base_score
    if in_title:
        relevance = min(relevance + 0.1, 1.0)
    if occurrences > 1:
        relevance = min(relevance + (0.02 * occurrences), 1.0)
    
    return round(relevance, 2)

def determine_skill_priority(skill, job_description, index):
    """Determine priority of a missing skill"""
    jd_lower = job_description.lower()
    skill_lower = skill.lower()
    
    # High priority if mentioned multiple times or early
    occurrences = jd_lower.count(skill_lower)
    first_500 = jd_lower[:500]
    
    if skill_lower in first_500 or occurrences >= 2:
        return "High"
    elif index < 5:
        return "High"
    elif index < 8:
        return "Medium"
    else:
        return "Low"

def generate_skill_suggestion(skill, job_description, include_examples):
    """Generate a specific suggestion for learning a skill"""
    skill_lower = skill.lower()
    
    # Contextual suggestions based on skill type
    learning_resources = {
        'python': 'Complete Python courses on Coursera or build projects with Django/Flask',
        'javascript': 'Build interactive projects and learn modern frameworks like React',
        'react': 'Create portfolio projects and contribute to open-source React applications',
        'aws': 'Get AWS Certified Solutions Architect certification and practice with free tier',
        'docker': 'Containerize your existing projects and learn Kubernetes basics',
        'kubernetes': 'Deploy applications on K8s and get CKA certification',
        'machine learning': 'Complete Andrew Ng\'s ML course and build ML projects',
        'sql': 'Practice on LeetCode SQL problems and work with real databases',
    }
    
    for key, suggestion in learning_resources.items():
        if key in skill_lower:
            return suggestion if include_examples else f"Learn {skill} through structured courses and hands-on projects"
    
    # Generic but specific suggestion
    if include_examples:
        return f"Master {skill} by: 1) Taking specialized courses, 2) Building portfolio projects, 3) Contributing to open-source"
    else:
        return f"Develop proficiency in {skill} through courses and practical application"

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume(request: AnalyzeRequest):
    """
    Analyze resume against job description with AI-powered comprehensive matching
    """
    try:
        # Extract analysis configuration
        detail_level = getattr(request, 'detail_level', 'detailed')
        priority_focus = getattr(request, 'priority_focus', 'balanced')
        include_examples = getattr(request, 'include_examples', True)
        
        print(f"\n[Analysis] Starting with config: detail={detail_level}, focus={priority_focus}")
        
        # Use AI to extract skills comprehensively
        resume_skills = extract_skills(request.resume_text)
        jd_skills = extract_skills(request.job_description)
        
        print(f"[Analysis] Resume skills found: {len(resume_skills)}")
        print(f"[Analysis] JD skills required: {len(jd_skills)}")
        
        # Find matched and missing skills with fuzzy matching
        matched = find_matched_skills(resume_skills, jd_skills)
        missing = find_missing_skills(resume_skills, jd_skills)
        
        print(f"[Analysis] Matched: {len(matched)}, Missing: {len(missing)}")
        
        # Calculate comprehensive match score
        score = calculate_match_score(matched, jd_skills, request.resume_text, request.job_description)
        
        # Use AI to analyze gaps with context
        gaps = await analyze_gaps_with_ai(
            request.resume_text, 
            request.job_description, 
            missing, 
            matched,
            detail_level
        )
        
        # Generate AI-powered recommendations
        recommendations = await generate_recommendations_with_ai(
            request.resume_text,
            request.job_description,
            gaps,
            missing,
            matched,
            score,
            detail_level,
            include_examples
        )
        
        # Generate personalized top tip
        top_tip = await generate_personalized_tip(
            score, 
            gaps, 
            missing, 
            matched,
            priority_focus
        )
        
        # Convert to response format with relevance scoring
        matched_skills = [
            SkillMatch(
                name=skill, 
                relevance=calculate_skill_relevance(skill, request.job_description, 0.85 + (i * 0.02))
            )
            for i, skill in enumerate(matched[:15])
        ]
        
        # Prioritize missing skills by importance
        missing_skills = [
            MissingSkill(
                name=skill,
                priority=determine_skill_priority(skill, request.job_description, i),
                suggestion=generate_skill_suggestion(skill, request.job_description, include_examples)
            )
            for i, skill in enumerate(missing[:10])
        ]
        
        print(f"[Analysis] Complete! Score: {score}%")
        
        return AnalyzeResponse(
            match_score=score,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            gaps=gaps,
            recommendations=recommendations,
            top_tip=top_tip,
            model=os.getenv("LLM_MODEL", "gemini-2.0-flash")
        )
    except Exception as e:
        print(f"Analysis error: {e}")
        import traceback
        traceback.print_exc()
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
