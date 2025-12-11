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
    """Extract skills using Gemini AI with comprehensive prompt"""
    try:
        # Use the configured model from environment
        model_name = os.getenv("LLM_MODEL", "gemini-2.0-flash-exp")
        model = genai.GenerativeModel(model_name)
        
        prompt = f"""Extract ALL technical and soft skills from this text. Be extremely thorough and consistent.

Include:
- Programming languages (Python, Java, JavaScript, etc.)
- Frameworks & libraries (React, Node.js, Django, etc.)
- Tools & platforms (Git, Docker, AWS, Jenkins, etc.)
- Databases (MongoDB, MySQL, PostgreSQL, etc.)
- Methodologies (Agile, Scrum, DevOps, CI/CD, etc.)
- Soft skills (Leadership, Communication, Problem-solving, etc.)
- Domain expertise (Machine Learning, Data Analysis, Cloud Computing, etc.)

IMPORTANT: Extract skills EXACTLY as they appear. Use standard capitalization (Python, not PYTHON).

Text:
{text[:4000]}

Return a comma-separated list of 20-50 skills in this exact format:
Python, JavaScript, React, Node.js, MongoDB, AWS, Docker, Git, Agile, Leadership"""

        response = model.generate_content(prompt)
        skills_text = response.text.strip()
        
        # Parse and clean the response
        skills = []
        for s in skills_text.split(','):
            skill = s.strip()
            # Remove quotes, bullets, numbering  
            skill = re.sub(r'^["\'*\-\d.)\]]+\s*', '', skill)
            skill = re.sub(r'["\'*]+$', '', skill)
            
            if skill and len(skill) > 1 and len(skill) < 50:
                # Capitalize properly
                if skill.isupper() and len(skill) <= 6:  # Acronyms
                    skills.append(skill)
                else:
                    skills.append(skill.title())
        
        print(f"AI extracted {len(skills)} skills")
        return list(set(skills))  # Remove duplicates
        
    except Exception as e:
        print(f"AI skill extraction error: {e}")
        return []
        
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
