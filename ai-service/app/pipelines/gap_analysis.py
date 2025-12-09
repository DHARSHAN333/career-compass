from typing import List
from app.schemas.responses import Gap

def identify_gaps(resume_text: str, job_description: str, missing_skills: List[str]) -> List[Gap]:
    """
    Identify and categorize skill gaps
    """
    gaps = []
    
    # Categorize missing skills into gaps
    technical_skills = ['python', 'javascript', 'java', 'react', 'node.js', 'sql', 'aws']
    tools = ['docker', 'kubernetes', 'git', 'jenkins', 'jira']
    
    for i, skill in enumerate(missing_skills[:5]):
        skill_lower = skill.lower()
        
        if any(tech in skill_lower for tech in technical_skills):
            category = 'Technical Skills'
            priority = 'High' if i < 2 else 'Medium'
            description = f'Missing {skill} expertise'
            actionable = f'Complete online courses or build projects using {skill}'
        elif any(tool in skill_lower for tool in tools):
            category = 'Tools & Technologies'
            priority = 'Medium' if i < 3 else 'Low'
            description = f'No experience with {skill}'
            actionable = f'Gain hands-on experience with {skill} through practice projects'
        else:
            category = 'Additional Skills'
            priority = 'Medium'
            description = f'Could benefit from {skill} knowledge'
            actionable = f'Consider learning {skill} to strengthen your profile'
        
        gaps.append(Gap(
            category=category,
            description=description,
            priority=priority,
            actionable=actionable
        ))
    
    # Add experience gaps if detected
    if 'senior' in job_description.lower() and 'senior' not in resume_text.lower():
        gaps.append(Gap(
            category='Experience Level',
            description='Role requires senior-level experience',
            priority='High',
            actionable='Highlight leadership and advanced technical contributions'
        ))
    
    return gaps[:6]

def categorize_gaps(gaps: list) -> dict:
    """
    Categorize gaps into different types (technical, soft skills, etc.)
    """
    categories = {
        'technical': [],
        'soft_skills': [],
        'tools': [],
        'other': []
    }
    
    technical_keywords = ['python', 'javascript', 'java', 'programming']
    tools_keywords = ['docker', 'kubernetes', 'aws', 'git']
    soft_keywords = ['leadership', 'communication', 'teamwork']
    
    for gap in gaps:
        gap_lower = gap.lower()
        if any(kw in gap_lower for kw in technical_keywords):
            categories['technical'].append(gap)
        elif any(kw in gap_lower for kw in tools_keywords):
            categories['tools'].append(gap)
        elif any(kw in gap_lower for kw in soft_keywords):
            categories['soft_skills'].append(gap)
        else:
            categories['other'].append(gap)
    
    return categories
