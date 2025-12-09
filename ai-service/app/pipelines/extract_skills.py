import re
from typing import List

# Comprehensive skill database
TECH_SKILLS = {
    'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust',
    'typescript', 'scala', 'r', 'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express',
    'django', 'flask', 'spring', 'asp.net', 'laravel', 'rails', 'fastapi', 'next.js',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible',
    'machine learning', 'deep learning', 'ai', 'tensorflow', 'pytorch', 'data science',
    'pandas', 'numpy', 'spark', 'hadoop', 'kafka', 'git', 'jira', 'agile', 'scrum',
    'rest api', 'graphql', 'microservices', 'ci/cd', 'devops', 'linux', 'unix',
    'leadership', 'communication', 'teamwork', 'problem solving'
}

def extract_skills(text: str) -> List[str]:
    """Extract skills from text using keyword matching"""
    if not text:
        return []
    
    text_lower = text.lower()
    found_skills = set()
    
    for skill in TECH_SKILLS:
        if len(skill.split()) == 1:
            pattern = r'\b' + re.escape(skill) + r'\b'
        else:
            pattern = re.escape(skill)
        
        if re.search(pattern, text_lower):
            found_skills.add(skill.title())
    
    return sorted(list(found_skills))

def find_matched_skills(resume_skills: List[str], jd_skills: List[str]) -> List[str]:
    """Find overlapping skills"""
    resume_set = {s.lower() for s in resume_skills}
    jd_set = {s.lower() for s in jd_skills}
    matched = resume_set & jd_set
    return sorted([s.title() for s in matched])

def find_missing_skills(resume_skills: List[str], jd_skills: List[str]) -> List[str]:
    """Find skills in JD but not in resume"""
    resume_set = {s.lower() for s in resume_skills}
    jd_set = {s.lower() for s in jd_skills}
    missing = jd_set - resume_set
    return sorted([s.title() for s in missing])
