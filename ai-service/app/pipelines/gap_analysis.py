from typing import List
from app.schemas.responses import Gap

def identify_gaps(resume_text: str, job_description: str, missing_skills: List[str]) -> List[Gap]:
    """
    Identify and categorize skill gaps with accurate priority
    """
    gaps = []
    
    # Categorize missing skills into gaps (focus on the most critical)
    technical_skills = ['python', 'javascript', 'java', 'react', 'node.js', 'sql', 'aws', 
                        'typescript', 'docker', 'kubernetes', 'machine learning', 'ai']
    tools = ['docker', 'kubernetes', 'git', 'jenkins', 'jira', 'terraform', 'ansible']
    frameworks = ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'express']
    
    # Take only the top 5-6 missing skills to avoid overwhelming the user
    for i, skill in enumerate(missing_skills[:6]):
        skill_lower = skill.lower()
        
        # Determine category and priority based on skill type and position
        if any(tech in skill_lower for tech in technical_skills):
            category = 'Technical Skills'
            # First 2 missing skills are high priority
            priority = 'High' if i < 2 else 'Medium'
            description = f'Lacks {skill} expertise required for this role'
            actionable = f'Complete a comprehensive {skill} course and build 2-3 projects to demonstrate proficiency'
        elif any(fw in skill_lower for fw in frameworks):
            category = 'Framework Knowledge'
            priority = 'High' if i < 2 else 'Medium'
            description = f'No hands-on experience with {skill}'
            actionable = f'Learn {skill} fundamentals and create a portfolio project using this framework'
        elif any(tool in skill_lower for tool in tools):
            category = 'Tools & Technologies'
            priority = 'Medium' if i < 3 else 'Low'
            description = f'Missing {skill} proficiency'
            actionable = f'Gain practical experience with {skill} through hands-on practice and tutorials'
        else:
            category = 'Additional Skills'
            priority = 'Medium' if i < 3 else 'Low'
            description = f'Would benefit from {skill} knowledge'
            actionable = f'Study {skill} to strengthen your technical profile and increase job match'
        
        gaps.append(Gap(
            category=category,
            description=description,
            priority=priority,
            actionable=actionable
        ))
    
    # Add experience gap if detected
    if 'senior' in job_description.lower() and 'senior' not in resume_text.lower():
        gaps.append(Gap(
            category='Experience Level',
            description='Role requires senior-level experience which may not be clearly demonstrated',
            priority='High',
            actionable='Emphasize leadership initiatives, mentoring experience, and advanced technical contributions in your resume'
        ))
    
    # Check for management/leadership requirements
    if any(keyword in job_description.lower() for keyword in ['lead', 'manager', 'team lead']):
        if not any(keyword in resume_text.lower() for keyword in ['led', 'managed', 'mentored', 'leadership']):
            gaps.append(Gap(
                category='Leadership Experience',
                description='Limited evidence of team leadership or management experience',
                priority='High',
                actionable='Highlight any team projects, mentoring, or technical leadership experiences you have had'
            ))
    
    return gaps[:6]  # Return max 6 most critical gaps

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
