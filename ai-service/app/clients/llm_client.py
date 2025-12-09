from typing import List, Dict, Optional
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# Check if OpenAI is available
try:
    from langchain.chat_models import ChatOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Configure Google Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    GEMINI_AVAILABLE = True
else:
    GEMINI_AVAILABLE = False

def get_llm():
    """Get LangChain LLM instance (for OpenAI)"""
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    
    if not api_key or not OPENAI_AVAILABLE:
        return None
    
    return ChatOpenAI(
        temperature=0.7,
        model_name=model,
        openai_api_key=api_key
    )

def get_gemini_model():
    """Get Google Gemini model instance"""
    if not GEMINI_AVAILABLE:
        return None
    
    model_name = os.getenv("LLM_MODEL", "gemini-2.5-flash")
    return genai.GenerativeModel(model_name)

async def get_llm_response(prompt: str, context: str = "", history: Optional[List[Dict]] = None) -> str:
    """
    Get response from LLM (Gemini or OpenAI) or provide intelligent fallback
    """
    # Try Gemini first
    if GEMINI_AVAILABLE:
        try:
            model = get_gemini_model()
            full_prompt = f"{context}\n\n{prompt}" if context else prompt
            response = model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            print(f"Gemini Error: {e}")
    
    # Fallback to OpenAI
    llm = get_llm()
    if llm is not None:
        try:
            full_prompt = f"{context}\n\n{prompt}" if context else prompt
            response = llm.predict(full_prompt)
            return response
        except Exception as e:
            print(f"OpenAI Error: {e}")
    
    # Final fallback to mock response
    return get_mock_response(prompt, context)

def get_mock_response(prompt: str, context: str = "") -> str:
    """
    Provide intelligent mock responses based on keywords and context
    """
    prompt_lower = prompt.lower()
    
    # Extract context information if available
    match_score = 0
    if 'match_score' in context.lower():
        try:
            import re
            score_match = re.search(r'match_score["\s:]+(\d+)', context.lower())
            if score_match:
                match_score = int(score_match.group(1))
        except:
            pass
    
    # Skill learning questions
    if any(word in prompt_lower for word in ['skill', 'learn', 'priorit', 'study']):
        return (
            "Based on your analysis, I recommend prioritizing skills in this order:\\n"
            "\\n**High Priority:**\\n"
            "1. Focus on the high-priority gaps identified in your Gap Analysis\\n"
            "2. Start with skills that are most frequently mentioned in the job description\\n"
            "3. Consider certifications for cloud technologies (AWS, Azure) if applicable\\n"
            "\\n**Learning Resources:**\\n"
            "- Online platforms: Coursera, Udemy, Pluralsight\\n"
            "- Official documentation and tutorials\\n"
            "- Build hands-on projects to demonstrate proficiency\\n"
            "- Join communities (GitHub, Stack Overflow, Discord)\\n"
            "\\nTip: Focus on one skill at a time and aim for practical application over theory."
        )
    
    # Resume improvement questions
    elif any(word in prompt_lower for word in ['improve', 'better', 'stronger', 'enhance']):
        return (
            "Here are specific ways to improve your resume match:\\n"
            "\\n**Content:**\\n"
            "1. Add quantifiable achievements (e.g., 'Improved performance by 40%')\\n"
            "2. Use action verbs (Led, Developed, Implemented, Optimized)\\n"
            "3. Include relevant keywords from the job description\\n"
            "4. Highlight impact and outcomes, not just responsibilities\\n"
            "\\n**Structure:**\\n"
            "5. Lead with your strongest, most relevant experience\\n"
            "6. Keep descriptions concise but impactful (2-3 bullet points per role)\\n"
            "7. Include a summary section highlighting your key strengths\\n"
            "\\n**Technical:**\\n"
            "8. Create a dedicated skills section organized by category\\n"
            "9. Mention specific tools, frameworks, and technologies\\n"
            "10. Include links to portfolio, GitHub, or relevant projects"
        )
    
    # Readiness/qualification questions
    elif any(word in prompt_lower for word in ['ready', 'qualified', 'chance', 'fit']):
        readiness_msg = "You have a solid foundation" if match_score >= 60 else "You should focus on key skill development"
        return (
            f"{readiness_msg} for this role. \\n"
            f"\\n**Your Strengths:**\\n"
            f"- Relevant experience in core technologies\\n"
            f"- Demonstrated ability to learn and adapt\\n"
            f"\\n**Areas to Develop:**\\n"
            f"- Address high-priority skill gaps through courses or projects\\n"
            f"- Quantify your achievements to showcase impact\\n"
            f"- Highlight relevant projects prominently\\n"
            f"\\nRemember: Employers value attitude, learning ability, and cultural fit as much as current skills. "
            f"Be honest about gaps and emphasize your commitment to growth."
        )
    
    # Experience/project presentation
    elif any(word in prompt_lower for word in ['experience', 'project', 'highlight', 'showcase']):
        return (
            "Use the **STAR method** to present your experience effectively:\\n"
            "\\n**S**ituation: Set the context\\n"
            "- What was the business need or challenge?\\n"
            "\\n**T**ask: Explain your specific responsibility\\n"
            "- What were you tasked to accomplish?\\n"
            "\\n**A**ction: Describe what you did\\n"
            "- What technologies and approaches did you use?\\n"
            "- What decisions did you make?\\n"
            "\\n**R**esult: Quantify the impact\\n"
            "- Metrics: performance, time saved, revenue impact\\n"
            "- Business outcomes achieved\\n"
            "\\n**Example:**\\n"
            "'Led migration of monolithic application to microservices architecture using Docker and Kubernetes, "
            "reducing deployment time by 65% and improving system uptime to 99.9%, serving 100K+ daily active users.'"
        )
    
    # Interview preparation
    elif any(word in prompt_lower for word in ['interview', 'prepare']):
        return (
            "Interview Preparation Checklist:\\n"
            "\\n**Research Phase:**\\n"
            "1. Study the company: products, culture, tech stack\\n"
            "2. Review the job description thoroughly\\n"
            "3. Research your interviewers on LinkedIn\\n"
            "\\n**Preparation:**\\n"
            "4. Prepare 5-7 STAR examples showcasing different skills\\n"
            "5. Practice explaining your projects clearly and concisely\\n"
            "6. Review technical concepts relevant to the role\\n"
            "7. Prepare thoughtful questions for the interviewer\\n"
            "\\n**Technical:**\\n"
            "8. Practice coding problems (LeetCode, HackerRank)\\n"
            "9. Review system design fundamentals\\n"
            "10. Be ready to discuss trade-offs and decisions\\n"
            "\\n**During Interview:**\\n"
            "- Be honest about what you don't know\\n"
            "- Show enthusiasm and curiosity\\n"
            "- Think aloud to demonstrate problem-solving"
        )
    
    # Certification questions
    elif 'certif' in prompt_lower or 'course' in prompt_lower:
        return (
            "Recommended certifications by area:\\n"
            "\\n**Cloud & Infrastructure:**\\n"
            "- AWS Solutions Architect / Developer Associate\\n"
            "- Microsoft Azure Administrator\\n"
            "- Google Cloud Professional\\n"
            "\\n**Development:**\\n"
            "- Modern Web Development (FreeCodeCamp, Udemy)\\n"
            "- Professional Scrum Developer\\n"
            "- Oracle Java Certification\\n"
            "\\n**Management & Process:**\\n"
            "- PMP (Project Management Professional)\\n"
            "- Certified Scrum Master\\n"
            "- ITIL Foundation\\n"
            "\\n**Security:**\\n"
            "- CompTIA Security+\\n"
            "- CISSP\\n"
            "\\nChoose certifications that align with your career goals and the job requirements. "
            "Many offer free trials or affordable learning paths."
        )
    
    # Gap-related questions
    elif 'gap' in prompt_lower or 'missing' in prompt_lower or 'lack' in prompt_lower:
        return (
            "Addressing skill gaps effectively:\\n"
            "\\n**Prioritization:**\\n"
            "1. Focus on HIGH priority gaps first (biggest impact on match score)\\n"
            "2. Choose skills that appear in multiple job descriptions\\n"
            "3. Balance quick wins with long-term development\\n"
            "\\n**Action Plan:**\\n"
            "- Break each skill into learnable sub-topics\\n"
            "- Set specific, measurable goals (e.g., 'Complete AWS course by end of month')\\n"
            "- Build a project demonstrating the skill\\n"
            "- Update your resume as you learn\\n"
            "\\n**Resources:**\\n"
            "- Free: FreeCodeCamp, YouTube, official docs\\n"
            "- Paid: Udemy, Coursera, Pluralsight\\n"
            "- Practice: LeetCode, HackerRank, personal projects\\n"
            "\\nRemember: You don't need to master everything before applying. "
            "Show continuous learning and practical application."
        )
    
    # Salary/compensation
    elif 'salary' in prompt_lower or 'compensation' in prompt_lower or 'pay' in prompt_lower:
        return (
            "Salary negotiation guidance:\\n"
            "\\n**Research:**\\n"
            "1. Use Glassdoor, Levels.fyi, PayScale for market data\\n"
            "2. Consider: location, company size, industry, experience level\\n"
            "3. Factor in total compensation (base + bonus + equity + benefits)\\n"
            "\\n**Timing:**\\n"
            "- Let the employer mention numbers first if possible\\n"
            "- Discuss after demonstrating your value\\n"
            "- Don't negotiate too early in the process\\n"
            "\\n**Strategy:**\\n"
            "- Provide a range (with your target as the lower bound)\\n"
            "- Justify with your skills, experience, and market research\\n"
            "- Be prepared to discuss non-salary benefits\\n"
            "- Stay professional and positive\\n"
            "\\nRemember: Everything is negotiable, but timing and approach matter."
        )
    
    # Default helpful response
    else:
        return (
            "I'm your AI career advisor! I can help you with:\\n"
            "\\n📚 **Skill Development:**\\n"
            "- Which skills to prioritize and learn\\n"
            "- Best resources and learning paths\\n"
            "\\n📝 **Resume Improvement:**\\n"
            "- How to better present your experience\\n"
            "- Quantifying achievements and impact\\n"
            "\\n🎯 **Job Preparation:**\\n"
            "- Interview strategies and preparation\\n"
            "- Addressing skill gaps\\n"
            "- Career growth advice\\n"
            "\\n💼 **Career Strategy:**\\n"
            "- Understanding your fit for roles\\n"
            "- Certifications and credentials\\n"
            "- Salary and negotiation guidance\\n"
            "\\nAsk me anything specific about your career development!"
        )
