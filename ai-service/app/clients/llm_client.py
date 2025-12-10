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
            print("Using Gemini AI for response...")
            model = get_gemini_model()
            full_prompt = f"{context}\n\n{prompt}" if context else prompt
            response = model.generate_content(full_prompt)
            print("Gemini response received")
            return response.text
        except Exception as e:
            print(f"Gemini Error: {e}")
    else:
        print("Gemini not available (missing API key)")
    
    # Fallback to OpenAI
    llm = get_llm()
    if llm is not None:
        try:
            print("Using OpenAI for response...")
            full_prompt = f"{context}\n\n{prompt}" if context else prompt
            response = llm.predict(full_prompt)
            print("OpenAI response received")
            return response
        except Exception as e:
            print(f"OpenAI Error: {e}")
    
    # Final fallback to mock response
    print("Using mock response (AI services unavailable)")
    return get_mock_response(prompt, context)

def get_mock_response(prompt: str, context: str = "") -> str:
    """
    Provide intelligent mock responses based on keywords and actual resume context
    """
    prompt_lower = prompt.lower()
    
    # Extract detailed context information
    import re
    match_score = 0
    matched_skills = []
    missing_skills = []
    resume_snippet = ""
    
    if context:
        # Extract match score
        score_match = re.search(r'MATCH SCORE[:\s]+(\d+)', context, re.IGNORECASE)
        if score_match:
            match_score = int(score_match.group(1))
        
        # Extract matched skills
        matched_match = re.search(r'MATCHED SKILLS[:\s]+([^\n]+)', context, re.IGNORECASE)
        if matched_match:
            matched_skills = [s.strip() for s in matched_match.group(1).split(',')[:5]]
        
        # Extract missing skills
        missing_match = re.search(r'MISSING SKILLS[:\s]+([^\n]+)', context, re.IGNORECASE)
        if missing_match:
            missing_skills = [s.strip() for s in missing_match.group(1).split(',')[:5]]
        
        # Extract resume snippet (first 200 chars of resume)
        resume_match = re.search(r"CANDIDATE'S RESUME[:\s]+([^\n]{50,200})", context, re.IGNORECASE)
        if resume_match:
            resume_snippet = resume_match.group(1).strip()
    
    # Greetings and simple questions
    if any(word in prompt_lower for word in ['hi', 'hello', 'hey', 'greetings']) and len(prompt_lower.split()) <= 3:
        if match_score > 0:
            return (
                f"Hello! I'm your AI Career Advisor.\n\n"
                f"I've analyzed your resume and you have a **{match_score}% match** with the job!\n\n"
                f"I can help you with:\n"
                f"- Understanding your strengths and gaps\n"
                f"- Skill development priorities\n"
                f"- Resume improvement tips\n"
                f"- Interview preparation\n\n"
                f"What would you like to know?"
            )
        return ("Hello! I'm your AI Career Advisor. I can help with resume analysis, career advice, "
                "skill development, and interview prep. What would you like to know?")
    
    # Skill learning questions
    if any(word in prompt_lower for word in ['skill', 'learn', 'priorit', 'study', 'what skills']):
        response_parts = []
        
        # Reference actual skills
        if matched_skills:
            response_parts.append(f"**Your Strong Skills (already on your resume):**\n{', '.join(matched_skills)}")
        
        if missing_skills:
            response_parts.append(f"\n**Skills You Should Learn (missing from your profile):**\n" + 
                                "\n".join([f"{i+1}. **{skill}** - High priority for this role" 
                                          for i, skill in enumerate(missing_skills[:3])]))
        
        response_parts.append(
            "\n**Learning Strategy:**\n"
            "- Start with the first missing skill - take an online course (Udemy, Coursera)\n"
            "- Build a hands-on project to demonstrate proficiency\n"
            "- Add it to your resume with project examples\n"
            "- Then move to the next skill\n"
            "\n**Tip:** Focus on practical application over theory. Build real projects!"
        )
        
        return "\n".join(response_parts) if response_parts else (
            "Based on your Gap Analysis, prioritize the high-priority skills. "
            "Focus on skills most frequently mentioned in the job description."
        )
    
    # Resume improvement questions
    elif any(word in prompt_lower for word in ['improve', 'better', 'stronger', 'enhance', 'resume']):
        response_parts = []
        
        if resume_snippet:
            response_parts.append(f"Looking at your profile: \"{resume_snippet[:100]}...\"")
        
        response_parts.append(
            "\n**Specific Ways to Improve Your Resume:**\n"
            "1. **Add Quantifiable Achievements** - Instead of 'Managed projects', write 'Led 5 projects serving 100K users, improving performance by 40%'\n"
            "2. **Use Action Verbs** - Led, Developed, Implemented, Optimized, Architected\n"
            "3. **Include Keywords** - Add relevant skills from the job description"
        )
        
        if missing_skills:
            response_parts.append(f"\n4. **Add Missing Skills** - Consider adding: {', '.join(missing_skills[:3])}")
        
        response_parts.append(
            "\n5. **Show Impact** - Focus on outcomes, not just tasks\n"
            "6. **Technical Details** - Mention specific tools/frameworks you used\n"
            "7. **Portfolio Links** - Add GitHub, LinkedIn, or project demos"
        )
        
        return "\n".join(response_parts)
    
    # Readiness/qualification questions
    elif any(word in prompt_lower for word in ['ready', 'qualified', 'chance', 'fit', 'strong']):
        if match_score >= 80:
            readiness = f"Excellent news! Your **{match_score}% match score** shows you're highly qualified"
        elif match_score >= 60:
            readiness = f"Good news! Your **{match_score}% match score** shows you have a solid foundation"
        else:
            readiness = f"Your **{match_score}% match score** indicates some skill gaps to address"
        
        response_parts = [readiness]
        
        if matched_skills:
            response_parts.append(f"\n**Your Strongest Qualifications:**\n" + 
                                "\n".join([f"- {skill}" for skill in matched_skills[:4]]))
        
        if missing_skills:
            response_parts.append(f"\n**Skills to Develop:**\n" + 
                                "\n".join([f"- {skill}" for skill in missing_skills[:3]]))
        
        if resume_snippet:
            response_parts.append(f"\nBased on your background ({resume_snippet[:100]}...), " + 
                                "focus on highlighting your relevant experience and addressing key skill gaps.")
        
        response_parts.append("\nTIP: Employers value attitude and learning ability. " + 
                            "Be honest about gaps and show enthusiasm to learn!")
        
        return "\n".join(response_parts)
    
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
