from typing import List
from app.schemas.responses import Recommendation, Gap

def generate_tips(resume_text: str, job_description: str, 
                 gaps: List[Gap], missing_skills: List[str]) -> List[Recommendation]:
    """
    Generate actionable recommendations
    """
    recommendations = []
    
    # High priority recommendations based on gaps
    if len(missing_skills) > 0:
        recommendations.append(Recommendation(
            text=f"Learn {', '.join(missing_skills[:3])} to better match job requirements",
            priority='High',
            impact='High'
        ))
    
    # Check for quantifiable achievements
    if not any(char.isdigit() for char in resume_text[:500]):
        recommendations.append(Recommendation(
            text='Add quantifiable achievements (e.g., "Improved performance by 40%")',
            priority='High',
            impact='High'
        ))
    
    # Check for action verbs
    action_verbs = ['led', 'developed', 'implemented', 'designed', 'managed', 'created']
    if not any(verb in resume_text.lower() for verb in action_verbs):
        recommendations.append(Recommendation(
            text='Use strong action verbs to describe your experience',
            priority='Medium',
            impact='Medium'
        ))
    
    # Industry-specific certifications
    if 'aws' in job_description.lower() and 'aws' in [s.lower() for s in missing_skills]:
        recommendations.append(Recommendation(
            text='Consider AWS certification to demonstrate cloud expertise',
            priority='Medium',
            impact='High'
        ))
    
    # General improvement
    recommendations.append(Recommendation(
        text='Tailor resume to highlight relevant experience for this specific role',
        priority='Medium',
        impact='Medium'
    ))
    
    return recommendations[:5]

def generate_top_tip(score: int, gaps: List[Gap], missing_skills: List[str]) -> str:
    """
    Generate a single top priority tip
    """
    if score >= 80:
        return 'Your profile is a strong match! Focus on highlighting your key achievements and impact.'
    
    elif score >= 60:
        if missing_skills:
            top_missing = ', '.join(missing_skills[:2])
            return f'Strengthen your profile by gaining experience in {top_missing} to better align with job requirements.'
        return 'Focus on quantifying your achievements with specific metrics and outcomes.'
    
    else:
        if missing_skills:
            return f'Priority: Learn {missing_skills[0]} and build relevant projects to demonstrate your capability.'
        return 'Significant gaps identified. Focus on developing core skills and gaining relevant experience.'

def generate_tips_with_llm(resume_text: str, job_description: str, gaps: list) -> list:
    """
    Use LLM to generate more personalized and context-aware tips
    """
    prompt = f"""
    Given the following information, generate 3-5 specific, actionable tips to improve 
    the candidate's resume match for this job:
    
    Job Description: {job_description[:500]}...
    
    Skill Gaps: {', '.join(gaps)}
    
    Tips should be:
    - Specific and actionable
    - Realistic and achievable
    - Prioritized by importance
    
    Tips:
    """
    
    llm = get_llm_sync()
    response = llm.predict(prompt)
    
    # Parse response into list
    tips = [line.strip() for line in response.split('\n') if line.strip() and len(line) > 10]
    return tips[:5]
