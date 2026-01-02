from typing import List
import re

def calculate_match_score(matched_skills: List[str], jd_skills: List[str], 
                         resume_text: str, job_description: str) -> int:
    """
    Calculate comprehensive match score with multiple weighted factors
    Skills (40%), Experience (25%), Keywords (20%), Education (10%), Seniority (5%)
    """
    # Aggressive normalization for text comparison
    def normalize_text(text):
        # Remove all special characters, extra spaces, convert to lowercase
        text = re.sub(r'[^\w\s]', '', text.lower())
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    resume_normalized = normalize_text(resume_text)
    jd_normalized = normalize_text(job_description)
    
    # Check if texts are identical after normalization
    if resume_normalized == jd_normalized:
        print("[Scoring] ✓ IDENTICAL texts detected (exact match) - returning 100%")
        return 100
    
    # Calculate word-level similarity for near-identical cases (more reasonable thresholds)
    if len(resume_normalized) > 50 and len(jd_normalized) > 50:
        resume_words = set(resume_normalized.split())
        jd_words = set(jd_normalized.split())
        
        if len(jd_words) > 0:
            # Check both directions for similarity
            overlap = len(resume_words & jd_words)
            jd_coverage = overlap / len(jd_words)
            resume_coverage = overlap / len(resume_words) if len(resume_words) > 0 else 0
            avg_similarity = (jd_coverage + resume_coverage) / 2
            
            print(f"[Scoring] Text similarity: {avg_similarity:.1%} (JD: {jd_coverage:.1%}, Resume: {resume_coverage:.1%})")
            
            # More realistic similarity thresholds
            if avg_similarity >= 0.95:
                print(f"[Scoring] ✓ NEAR-IDENTICAL texts ({avg_similarity:.1%}) - returning 99%")
                return 99
            elif avg_similarity >= 0.90:
                print(f"[Scoring] ✓ Very similar texts ({avg_similarity:.1%}) - returning 96%")
                return 96
            elif avg_similarity >= 0.85:
                print(f"[Scoring] High similarity ({avg_similarity:.1%}) - returning 92%")
                return 92
    
    if not jd_skills or len(jd_skills) == 0:
        return 50  # Default score if no JD skills
    
    # 1. Skill match score (40% weight) - Most important
    skill_match_ratio = len(matched_skills) / len(jd_skills) if jd_skills else 0
    skill_score = skill_match_ratio * 40
    
    # Bonus for having many matched skills
    if len(matched_skills) >= 10:
        skill_score = min(skill_score + 5, 40)
    elif len(matched_skills) >= 7:
        skill_score = min(skill_score + 3, 40)
    
    # 2. Experience level match (25% weight)
    experience_score = 0
    jd_experience = extract_years_experience(job_description.lower())
    resume_experience = extract_years_experience(resume_text.lower())
    
    if jd_experience and resume_experience:
        if resume_experience >= jd_experience:
            experience_score = 25
        elif resume_experience >= jd_experience * 0.8:
            experience_score = 20
        elif resume_experience >= jd_experience * 0.6:
            experience_score = 15
        else:
            experience_score = 10
    elif resume_experience > 0:
        # Has some experience even if JD doesn't specify
        experience_score = 20
    else:
        experience_score = 10
    
    # 3. Keyword overlap (20% weight) - Context matching
    resume_lower = resume_text.lower()
    jd_lower = job_description.lower()
    
    # Extract important keywords (nouns, technical terms, excluding common words)
    common_words = {'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'will', 'your', 'our', 'their'}
    jd_words = set(word for word in jd_lower.split() if len(word) > 3 and word not in common_words)
    resume_words = set(word for word in resume_lower.split() if len(word) > 3 and word not in common_words)
    
    if jd_words:
        keyword_overlap = len(jd_words & resume_words) / len(jd_words)
        content_score = keyword_overlap * 20
    else:
        content_score = 10
    
    # 4. Education match (10% weight)
    education_score = check_education_match(resume_lower, jd_lower)
    
    # 5. Seniority and title match (5% weight)
    seniority_score = 5
    seniority_keywords = ['senior', 'lead', 'principal', 'staff', 'architect', 'manager', 'director']
    
    jd_has_senior = any(keyword in jd_lower for keyword in seniority_keywords)
    resume_has_senior = any(keyword in resume_lower for keyword in seniority_keywords)
    
    if jd_has_senior and not resume_has_senior:
        seniority_score = 2  # Penalty for applying to senior role without senior experience
    elif jd_has_senior and resume_has_senior:
        seniority_score = 5
    elif not jd_has_senior and resume_has_senior:
        seniority_score = 5  # Overqualified is okay
    
    # Calculate final score
    final_score = int(skill_score + experience_score + content_score + education_score + seniority_score)
    
    # Apply penalties for major mismatches
    if len(matched_skills) == 0:
        final_score = min(final_score, 30)  # Cap at 30% if no skills match
    elif len(matched_skills) < 3 and len(jd_skills) > 5:
        final_score = min(final_score, 45)  # Cap at 45% if very few skills match
    
    final_score = min(max(final_score, 5), 100)  # Ensure between 5-100%
    
    print(f"[Scoring] Breakdown -> Skills:{skill_score:.1f} Exp:{experience_score:.1f} Keywords:{content_score:.1f} Edu:{education_score:.1f} Senior:{seniority_score:.1f}")
    print(f"[Scoring] ✓ FINAL MATCH SCORE: {final_score}%")
    
    return final_score

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
