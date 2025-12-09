import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const AI_SERVICE_BASE_URL = config.aiServiceUrl;

const aiClient = {
  /**
   * Analyze resume against job description
   */
  async analyze(resumeText, jobDescription) {
    try {
      logger.info('Calling AI service for analysis');
      
      const response = await axios.post(
        `${AI_SERVICE_BASE_URL}/api/analyze`,
        {
          resume_text: resumeText,
          job_description: jobDescription
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        matchScore: response.data.match_score || 75,
        matchedSkills: response.data.matched_skills || [],
        missingSkills: response.data.missing_skills || [],
        gaps: response.data.gaps || [],
        recommendations: response.data.recommendations || [],
        topTip: response.data.top_tip || 'Focus on highlighting your relevant experience',
        model: response.data.model
      };

    } catch (error) {
      logger.error('AI service analyze error:', error.message);
      
      // Return mock data if AI service is unavailable
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        logger.warn('AI service unavailable, returning mock data');
        return this.getMockAnalysis(resumeText, jobDescription);
      }
      
      throw new Error('Failed to analyze resume');
    }
  },

  /**
   * Chat about an analysis
   */
  async chat(chatRequest) {
    try {
      const { message, context, history } = chatRequest;
      
      logger.info('Calling AI service for chat');
      
      const response = await axios.post(
        `${AI_SERVICE_BASE_URL}/api/chat`,
        {
          message,
          context: {
            resume_text: context.resumeText,
            job_description: context.jobDescription,
            match_score: context.matchScore,
            gaps: context.gaps
          },
          history: history || []
        },
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        response: response.data.response || response.data.message
      };

    } catch (error) {
      logger.error('AI service chat error:', error.message);
      
      // Return mock response if AI service is unavailable
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        logger.warn('AI service unavailable, returning mock chat response');
        return this.getMockChatResponse(chatRequest.message, chatRequest.context);
      }
      
      throw new Error('Failed to get chat response');
    }
  },

  /**
   * Mock analysis for testing without AI service
   */
  getMockAnalysis(resumeText, jobDescription) {
    const commonSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'];
    const matchedCount = Math.floor(Math.random() * 3) + 2;
    
    return {
      matchScore: 72,
      matchedSkills: commonSkills.slice(0, matchedCount).map(skill => ({
        name: skill,
        relevance: 0.8 + Math.random() * 0.2
      })),
      missingSkills: commonSkills.slice(matchedCount).map(skill => ({
        name: skill,
        priority: 'High',
        suggestion: `Consider learning ${skill} to improve your profile`
      })),
      gaps: [
        {
          category: 'Technical Skills',
          description: 'Cloud computing experience (AWS, Azure, or GCP)',
          priority: 'High',
          actionable: 'Complete AWS certification or build cloud-based projects'
        },
        {
          category: 'Experience',
          description: 'Leadership or team management experience',
          priority: 'Medium',
          actionable: 'Seek opportunities to lead projects or mentor junior developers'
        },
        {
          category: 'Soft Skills',
          description: 'Cross-functional collaboration experience',
          priority: 'Medium',
          actionable: 'Highlight any collaborative projects in your resume'
        }
      ],
      recommendations: [
        {
          text: 'Add quantifiable achievements to your work experience',
          priority: 'High',
          impact: 'High'
        },
        {
          text: 'Include relevant certifications and training',
          priority: 'Medium',
          impact: 'Medium'
        }
      ],
      topTip: 'Focus on quantifying your achievements with specific metrics and outcomes to make your resume stand out.',
      model: 'mock-v1'
    };
  },

  /**
   * Mock chat response for testing without AI service
   */
  getMockChatResponse(message, context = {}) {
    const lowerMessage = message.toLowerCase();
    const { matchScore = 0, gaps = [], skills = {}, recommendations = [] } = context;
    
    // Skill-related questions
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('priorit')) {
      const missingSkills = skills.missing || [];
      const highPriorityGaps = gaps.filter(g => g.priority === 'High');
      
      if (highPriorityGaps.length > 0) {
        const skillsList = highPriorityGaps.map(g => g.description).slice(0, 3).join(', ');
        return {
          response: `Based on your analysis, I recommend prioritizing these skills:\n\n${highPriorityGaps.slice(0, 3).map((g, i) => `${i+1}. **${g.description}**: ${g.actionable}`).join('\n')}\n\nFocus on high-priority gaps first to maximize your impact. Consider online courses (Coursera, Udemy) or hands-on projects to build expertise.`
        };
      }
      return {
        response: 'Start with the high-priority skills from your gap analysis. Consider online courses, certifications, or hands-on projects to build expertise. Focus on practical application over theory.'
      };
    }
    
    // Improvement questions
    if (lowerMessage.includes('improve') || lowerMessage.includes('better') || lowerMessage.includes('stronger')) {
      if (recommendations.length > 0) {
        return {
          response: `Here are specific ways to improve your resume:\n\n${recommendations.slice(0, 3).map((r, i) => `${i+1}. ${typeof r === 'string' ? r : r.text}`).join('\n')}\n\nAlso remember to add quantifiable achievements with specific metrics to make your experience stand out.`
        };
      }
      return {
        response: 'To improve your resume match score:\n1. Add quantifiable achievements with metrics (e.g., "Increased performance by 40%")\n2. Include relevant keywords from the job description\n3. Highlight projects that align with role requirements\n4. Use action verbs and focus on outcomes'
      };
    }
    
    // Ready/qualification questions
    if (lowerMessage.includes('ready') || lowerMessage.includes('qualified') || lowerMessage.includes('chance')) {
      let readiness = 'You have a moderate fit';
      if (matchScore >= 80) readiness = 'You\'re well-qualified';
      else if (matchScore >= 60) readiness = 'You have a good foundation';
      else readiness = 'You should focus on developing key skills';
      
      return {
        response: `${readiness} for this role with a ${matchScore}% match score.\n\n${matchScore >= 70 ? 'Your experience aligns well with the requirements. Focus on highlighting relevant achievements in your application.' : 'To improve your chances, prioritize the high-priority skill gaps and update your resume to emphasize relevant experience.'}\n\nRemember, even if gaps exist, your attitude, learning ability, and relevant experience matter greatly to employers.`
      };
    }
    
    // Experience/project questions
    if (lowerMessage.includes('experience') || lowerMessage.includes('project') || lowerMessage.includes('highlight')) {
      return {
        response: 'When describing your experience, use the STAR method:\n- **Situation**: Set the context\n- **Task**: Explain the challenge\n- **Action**: Describe what you did\n- **Result**: Quantify the impact\n\nExample: "Led a team of 3 to migrate legacy system to microservices, reducing deployment time by 60% and improving uptime to 99.9%"\n\nAlways quantify achievements with specific metrics and outcomes.'
      };
    }
    
    // Certification questions
    if (lowerMessage.includes('certif') || lowerMessage.includes('course') || lowerMessage.includes('training')) {
      return {
        response: 'Certifications that can boost your profile:\n1. **Cloud**: AWS Solutions Architect, Azure Administrator\n2. **Development**: Professional Scrum Developer, Modern Web Development\n3. **Management**: PMP, Agile/Scrum Master\n4. **Security**: CompTIA Security+, CISSP\n\nChoose certifications that align with the job requirements and your career goals. Many offer free trials or affordable options.'
      };
    }
    
    // Interview preparation
    if (lowerMessage.includes('interview') || lowerMessage.includes('prepare')) {
      return {
        response: 'Interview preparation checklist:\n\n**Before:**\n- Research the company and its tech stack\n- Review the job description thoroughly\n- Prepare STAR examples for your achievements\n\n**During:**\n- Highlight relevant projects and outcomes\n- Ask thoughtful questions about the role and team\n- Be honest about gaps and emphasize willingness to learn\n\n**Technical:**\n- Practice coding problems (LeetCode, HackerRank)\n- Review system design concepts\n- Prepare to discuss your projects in detail'
      };
    }
    
    // Gap-specific questions
    if (lowerMessage.includes('gap') || lowerMessage.includes('missing') || lowerMessage.includes('lack')) {
      const highPriorityGaps = gaps.filter(g => g.priority === 'High');
      if (highPriorityGaps.length > 0) {
        return {
          response: `Your main gaps to address:\n\n${highPriorityGaps.map((g, i) => `${i+1}. **${g.category}**: ${g.description}\n   Action: ${g.actionable}`).join('\n\n')}\n\nDon't let gaps discourage you - they're opportunities for growth. Focus on one at a time and track your progress.`
        };
      }
      return {
        response: 'Check your Gap Analysis tab for specific areas to improve. Focus on high-priority items first and create an action plan to address them systematically.'
      };
    }
    
    // Default response
    return {
      response: `I'm here to help with your career development! Based on your ${matchScore}% match score, I can assist with:\n\n- Specific skills to learn and prioritize\n- Ways to improve your resume and highlight achievements\n- Interview preparation and presentation strategies\n- Understanding your gaps and creating an action plan\n\nWhat would you like to know more about?`
    };
  }
};

export default aiClient;
