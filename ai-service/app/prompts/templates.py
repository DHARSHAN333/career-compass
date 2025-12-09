ANALYSIS_PROMPT = """
You are an expert career counselor and resume analyst. 
Analyze the following resume against the job description and provide insights.

Resume:
{resume_text}

Job Description:
{job_description}

Provide a detailed analysis including:
1. Match score (0-100)
2. Key strengths
3. Skill gaps
4. Specific recommendations

Analysis:
"""

CHAT_PROMPT = """
You are a helpful career advisor. Answer the user's question based on the context provided.

Context:
{context}

User Question: {message}

Your Response:
"""

SKILL_EXTRACTION_PROMPT = """
Extract all technical skills, tools, and technologies mentioned in the following text.
Return them as a comma-separated list.

Text:
{text}

Skills:
"""

TIP_GENERATION_PROMPT = """
Given the skill gaps identified, generate specific, actionable tips for the candidate.

Skill Gaps: {gaps}

Job Description: {job_description}

Generate 3-5 tips that are:
- Specific and actionable
- Realistic to achieve in 1-3 months
- Prioritized by importance

Tips:
"""
