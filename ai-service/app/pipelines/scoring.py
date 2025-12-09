from typing import List

def calculate_match_score(matched_skills: List[str], jd_skills: List[str], 
                         resume_text: str, job_description: str) -> int:
    """
    Calculate comprehensive match score
    """
    if not jd_skills:
        return 50  # Default score if no JD skills
    
    # Skill match score (70% weight)
    skill_score = (len(matched_skills) / len(jd_skills)) * 70 if jd_skills else 0
    
    # Content relevance (20% weight) - based on keyword overlap
    resume_lower = resume_text.lower()
    jd_lower = job_description.lower()
    jd_keywords = set(jd_lower.split())
    resume_keywords = set(resume_lower.split())
    keyword_overlap = len(jd_keywords & resume_keywords) / len(jd_keywords) if jd_keywords else 0
    content_score = keyword_overlap * 20
    
    # Experience indicators (10% weight)
    experience_score = 10
    if 'senior' in jd_lower and 'senior' not in resume_lower:
        experience_score = 5
    elif 'lead' in jd_lower and 'lead' not in resume_lower:
        experience_score = 5
    
    final_score = int(skill_score + content_score + experience_score)
    return min(max(final_score, 0), 100)

def calculate_weighted_score(resume_skills: list, jd_skills: list, weights: dict = None) -> int:
    """
    Calculate weighted score with different priorities for different skill types
    """
    if weights is None:
        weights = {
            'must_have': 1.0,
            'nice_to_have': 0.5
        }
    
    # This is a simplified implementation
    # In production, you'd classify skills by priority
    return calculate_match_score(resume_skills, jd_skills)
