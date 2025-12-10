from typing import List
import re

def calculate_match_score(matched_skills: List[str], jd_skills: List[str], 
                         resume_text: str, job_description: str) -> int:
    """
    Calculate comprehensive match score with multiple factors
    """
    if not jd_skills or len(jd_skills) == 0:
        return 50  # Default score if no JD skills
    
    # 1. Skill match score (50% weight)
    skill_match_ratio = len(matched_skills) / len(jd_skills) if jd_skills else 0
    skill_score = skill_match_ratio * 50
    
    # 2. Keyword overlap (25% weight) - more sophisticated matching
    resume_lower = resume_text.lower()
    jd_lower = job_description.lower()
    
    # Extract important keywords (nouns, technical terms)
    jd_words = set(word for word in jd_lower.split() if len(word) > 3)
    resume_words = set(word for word in resume_lower.split() if len(word) > 3)
    
    keyword_overlap = len(jd_words & resume_words) / len(jd_words) if jd_words else 0
    content_score = keyword_overlap * 25
    
    # 3. Experience level match (15% weight)
    experience_score = 15
    jd_experience = extract_years_experience(jd_lower)
    resume_experience = extract_years_experience(resume_lower)
    
    if jd_experience and resume_experience:
        if resume_experience >= jd_experience:
            experience_score = 15
        elif resume_experience >= jd_experience * 0.7:
            experience_score = 10
        else:
            experience_score = 5
    
    # Check seniority level
    if 'senior' in jd_lower and 'senior' not in resume_lower:
        experience_score *= 0.6
    elif 'lead' in jd_lower and 'lead' not in resume_lower:
        experience_score *= 0.7
    
    # 4. Education match (10% weight)
    education_score = check_education_match(resume_lower, jd_lower)
    
    # Calculate final score
    final_score = int(skill_score + content_score + experience_score + education_score)
    
    # Boost score if there are many matched skills
    if matched_skills and len(matched_skills) >= 5:
        final_score = min(final_score + 5, 100)
    
    return min(max(final_score, 5), 100)  # Ensure minimum 5%

def extract_years_experience(text: str) -> int:
    """Extract years of experience from text"""
    patterns = [
        r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
        r'experience\s+(?:of\s+)?(\d+)\+?\s*years?',
        r'(\d+)\+?\s*yrs?\s+exp'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return int(match.group(1))
    
    return 0

def check_education_match(resume: str, jd: str) -> int:
    """Check if education requirements are met (10% max)"""
    education_keywords = {
        'phd': 10,
        'ph.d': 10,
        'doctorate': 10,
        'master': 8,
        'msc': 8,
        'm.s': 8,
        'mba': 8,
        'bachelor': 6,
        'bsc': 6,
        'b.s': 6,
        'degree': 5
    }
    
    jd_education = set()
    resume_education = set()
    
    for keyword, value in education_keywords.items():
        if keyword in jd:
            jd_education.add(keyword)
        if keyword in resume:
            resume_education.add(keyword)
    
    if not jd_education:
        return 10  # No specific requirement
    
    if jd_education & resume_education:
        return 10  # Match found
    
    return 5  # Some education but not matching

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
    return calculate_match_score(resume_skills, jd_skills, "", "")
