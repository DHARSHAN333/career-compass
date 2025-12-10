import re
from typing import List
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# Comprehensive skill database
TECH_SKILLS = {
    'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust',
    'typescript', 'scala', 'r', 'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express',
    'django', 'flask', 'spring', 'asp.net', 'laravel', 'rails', 'fastapi', 'next.js', 'nuxt',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'elasticsearch', 'dynamodb',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'chef',
    'machine learning', 'deep learning', 'ai', 'tensorflow', 'pytorch', 'data science', 'nlp',
    'pandas', 'numpy', 'spark', 'hadoop', 'kafka', 'git', 'jira', 'agile', 'scrum', 'kanban',
    'rest api', 'graphql', 'microservices', 'ci/cd', 'devops', 'linux', 'unix', 'bash',
    'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
    'redux', 'webpack', 'babel', 'sass', 'less', 'tailwind', 'bootstrap', 'material-ui',
    'jquery', 'ajax', 'json', 'xml', 'yaml', 'nginx', 'apache', 'tomcat',
    'pytest', 'jest', 'mocha', 'junit', 'selenium', 'cypress', 'postman',
    'oauth', 'jwt', 'ssl', 'encryption', 'security', 'penetration testing',
    'tableau', 'power bi', 'excel', 'powerpoint', 'word', 'outlook'
}

def extract_skills_with_ai(text: str) -> List[str]:
    """Extract skills using Gemini AI"""
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""Extract ALL technical skills, tools, technologies, frameworks, languages, and soft skills from the following text.
Return ONLY a comma-separated list of skills, nothing else.
Include both explicit skills (e.g., "Python", "React", "AWS") and implied skills from experience descriptions.

Text:
{text[:3000]}

Skills (comma-separated):"""

        response = model.generate_content(prompt)
        skills_text = response.text.strip()
        
        # Parse the response
        skills = [s.strip().title() for s in skills_text.split(',') if s.strip()]
        return skills
        
    except Exception as e:
        print(f"AI skill extraction error: {e}")
        return []

def extract_skills(text: str) -> List[str]:
    """Extract skills from text using AI + keyword matching"""
    if not text:
        return []
    
    text_lower = text.lower()
    found_skills = set()
    
    # Method 1: Use AI extraction for comprehensive results
    try:
        ai_skills = extract_skills_with_ai(text)
        found_skills.update(ai_skills)
    except Exception as e:
        print(f"AI extraction failed, using keyword matching: {e}")
    
    # Method 2: Keyword matching as backup/supplement
    for skill in TECH_SKILLS:
        if len(skill.split()) == 1:
            pattern = r'\b' + re.escape(skill) + r'\b'
        else:
            pattern = re.escape(skill)
        
        if re.search(pattern, text_lower):
            found_skills.add(skill.title())
    
    # Also extract multi-word phrases that look like skills
    # Pattern: Capitalized words or acronyms
    words = text.split()
    for i, word in enumerate(words):
        # Acronyms (2-6 uppercase letters)
        if re.match(r'^[A-Z]{2,6}$', word) and word not in ['I', 'A']:
            found_skills.add(word)
        
        # Multi-word skills (e.g., "Machine Learning", "Cloud Computing")
        if i < len(words) - 1:
            two_word = f"{word} {words[i+1]}"
            if two_word.lower() in TECH_SKILLS:
                found_skills.add(two_word.title())
    
    return sorted(list(found_skills))

def find_matched_skills(resume_skills: List[str], jd_skills: List[str]) -> List[str]:
    """Find overlapping skills with fuzzy matching"""
    if not resume_skills or not jd_skills:
        return []
    
    resume_set = {s.lower().strip() for s in resume_skills}
    jd_set = {s.lower().strip() for s in jd_skills}
    
    matched = set()
    
    # Exact matches
    matched.update(resume_set & jd_set)
    
    # Fuzzy matching for similar skills
    for jd_skill in jd_set:
        for resume_skill in resume_set:
            # Check if one contains the other
            if jd_skill in resume_skill or resume_skill in jd_skill:
                matched.add(jd_skill)
            # Check for abbreviations (e.g., JS -> JavaScript)
            elif jd_skill.replace('.', '').replace(' ', '') in resume_skill.replace('.', '').replace(' ', ''):
                matched.add(jd_skill)
    
    return sorted([s.title() for s in matched])

def find_missing_skills(resume_skills: List[str], jd_skills: List[str]) -> List[str]:
    """Find skills in JD but not in resume"""
    if not jd_skills:
        return []
    
    resume_set = {s.lower().strip() for s in resume_skills}
    jd_set = {s.lower().strip() for s in jd_skills}
    
    missing = set()
    
    for jd_skill in jd_set:
        found = False
        for resume_skill in resume_set:
            # Check if skills match or are similar
            if jd_skill == resume_skill or jd_skill in resume_skill or resume_skill in jd_skill:
                found = True
                break
        if not found:
            missing.add(jd_skill)
    
    return sorted([s.title() for s in missing])
