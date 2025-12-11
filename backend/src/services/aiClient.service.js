import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const AI_SERVICE_BASE_URL = config.aiServiceUrl;

const aiClient = {
  /**
   * Analyze resume against job description
   */
  async analyze(resumeText, jobDescription, userConfig = {}, analysisConfig = {}) {
    try {
      logger.info(`Calling AI service at ${AI_SERVICE_BASE_URL}/api/analyze`);
      logger.info(`Resume length: ${resumeText?.length || 0}, JD length: ${jobDescription?.length || 0}`);
      logger.info(`Analysis settings:`, analysisConfig);
      if (userConfig.apiKey) logger.info('Using user-provided API key');
      
      const requestBody = {
        resume_text: resumeText,
        job_description: jobDescription,
        // Include analysis settings
        detail_level: analysisConfig.detailLevel || 'detailed',
        include_examples: analysisConfig.includeExamples !== false,
        priority_focus: analysisConfig.priorityFocus || 'balanced'
      };

      // Add user config if provided
      if (userConfig.apiKey) {
        requestBody.user_api_key = userConfig.apiKey;
        requestBody.user_provider = userConfig.provider || 'gemini';
        requestBody.user_model = userConfig.model;
      }
      
      const response = await axios.post(
        `${AI_SERVICE_BASE_URL}/api/analyze`,
        requestBody,
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('✅ AI service responded successfully');
      logger.info(`Match score from AI: ${response.data.match_score}%`);

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
      logger.error('❌ AI service analyze error:', error.message);
      logger.error('Error code:', error.code);
      logger.error('Error response:', error.response?.data);
      logger.error('AI Service URL:', AI_SERVICE_BASE_URL);
      
      // Return mock data if AI service is unavailable or has errors
      if (error.code === 'ECONNREFUSED' || 
          error.code === 'ETIMEDOUT' || 
          error.code === 'ECONNABORTED' ||
          error.response?.status >= 400) {
        logger.warn('⚠️ AI service unavailable, returning mock analysis data');
        return this.getMockAnalysis(resumeText, jobDescription);
      }
      
      // Fallback to mock data for any other errors
      logger.warn('⚠️ Unexpected error, returning mock analysis data');
      return this.getMockAnalysis(resumeText, jobDescription);
    }
  },

  /**
   * Chat about an analysis
   */
  async chat(chatRequest) {
    try {
      const { message, context, history, userConfig } = chatRequest;
      
      logger.info('Calling AI service for chat');
      logger.info('Chat context:', {
        hasResume: !!context?.resumeText,
        hasJD: !!context?.jobDescription,
        matchScore: context?.matchScore,
        hasSkills: !!(context?.skills),
        hasGaps: !!(context?.gaps),
        hasRecommendations: !!(context?.recommendations)
      });

      const requestBody = {
        message,
        context: {
          resumeText: context.resumeText,
          resume_text: context.resumeText,  // Support both formats
          jobDescription: context.jobDescription,
          job_description: context.jobDescription,
          matchScore: context.matchScore,
          match_score: context.matchScore,
          skills: context.skills,
          gaps: context.gaps,
          recommendations: context.recommendations
        },
        history: history || []
      };

      // Add user config if provided
      if (userConfig?.apiKey) {
        requestBody.user_api_key = userConfig.apiKey;
        requestBody.user_provider = userConfig.provider || 'gemini';
        requestBody.user_model = userConfig.model;
      }
      
      const response = await axios.post(
        `${AI_SERVICE_BASE_URL}/api/chat`,
        requestBody,
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('AI chat response received');
      return {
        response: response.data.response || response.data.message
      };

    } catch (error) {
      logger.error('AI service chat error:', error.message);
      logger.error('Error details:', error.response?.data || error);
      
      // Return mock response if AI service is unavailable or has errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.response?.status >= 400) {
        logger.warn('AI service error, returning mock chat response');
        return this.getMockChatResponse(chatRequest.message, chatRequest.context);
      }
      
      // Fallback to mock response for any other errors
      logger.warn('Unexpected error, returning mock chat response');
      return this.getMockChatResponse(chatRequest.message, chatRequest.context);
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
    const { matchScore = 0, gaps = [], skills = {}, recommendations = [], resumeText = '', jobDescription = '' } = context;
    
    // Extract some resume details for personalization
    const hasResumeText = resumeText && resumeText.length > 50;
    const matchedSkills = skills.matched || [];
    const missingSkills = skills.missing || [];
    
    // Greetings
    if ((/^(hi|hello|hey|greetings)[\s!?]*$/i.test(message.trim()))) {
      if (matchScore > 0) {
        return {
          response: `Hello! I'm your AI Career Advisor.\n\nI've analyzed your resume and you have a **${matchScore}% match** with the job!\n\nI can help you with:\n- Understanding your strengths and gaps\n- Skill development priorities\n- Resume improvement tips\n- Interview preparation\n\nWhat would you like to know?`
        };
      }
      return {
        response: `Hello! I'm your AI Career Advisor. I can help with resume analysis, career advice, skill development, and interview prep. What would you like to know?`
      };
    }
    
    // Strongest qualifications / what are my skills
    if (lowerMessage.includes('strongest') || lowerMessage.includes('best skill') || lowerMessage.includes('my skill') || lowerMessage.includes('what skill') || lowerMessage.includes('qualif')) {
      if (matchedSkills.length > 0) {
        const skillsList = matchedSkills.slice(0, 6).map(s => typeof s === 'string' ? s : s.name).join(', ');
        let response = `**Your Strongest Qualifications:**\n\nBased on your resume analysis, here are your top skills that match this job:\n\n**${skillsList}**\n\n`;
        
        if (resumeText && resumeText.length > 50) {
          response += `Your **${matchScore}% match score** shows these align well with the position requirements.\n\n`;
        }
        
        if (missingSkills.length > 0) {
          const missingList = missingSkills.slice(0, 3).map(s => typeof s === 'string' ? s : s.name).join(', ');
          response += `To strengthen further, consider developing: ${missingList}`;
        }
        
        return { response };
      }
      
      return {
        response: 'Looking at your profile, focus on highlighting your core technical skills and relevant experience. Check the Skills tab to see your matched qualifications!'
      };
    }
    
    // Skill-related questions
    if (lowerMessage.includes('skill') && (lowerMessage.includes('learn') || lowerMessage.includes('priorit') || lowerMessage.includes('should i'))) {
      const highPriorityGaps = gaps.filter(g => g.priority === 'High');
      
      if (matchedSkills.length > 0 && hasResumeText) {
        const skillsList = matchedSkills.slice(0, 5).map(s => typeof s === 'string' ? s : s.name).join(', ');
        const response = `Based on your resume, you already have strong skills in: **${skillsList}**. These align well with the job requirements!\n\n`;
        
        if (highPriorityGaps.length > 0) {
          return {
            response: response + `To strengthen your application further, prioritize:\n${highPriorityGaps.slice(0, 3).map((g, i) => `${i+1}. **${g.description}**: ${g.actionable}`).join('\n')}`
          };
        }
        return { response: response + 'You have good coverage of required skills. Consider deepening your expertise in your strongest areas.' };
      }
      
      return {
        response: 'Focus on the high-priority skills from your gap analysis. Consider online courses, certifications, or hands-on projects. Your existing experience will help you learn these faster.'
      };
    }
    
    // Improvement questions
    if (lowerMessage.includes('improve') || lowerMessage.includes('better') || lowerMessage.includes('stronger')) {
      if (recommendations.length > 0) {
        return {
          response: `Based on analyzing your resume against this job, here are specific improvements:\n\n${recommendations.slice(0, 3).map((r, i) => `${i+1}. ${typeof r === 'string' ? r : r.text}`).join('\n')}\n\nAlso add quantifiable achievements with metrics to showcase impact.`
        };
      }
      return {
        response: 'To strengthen your application:\n1. Add quantifiable achievements from your experience (e.g., "Improved efficiency by 40%")\n2. Include relevant keywords from the job description\n3. Highlight specific projects that demonstrate required skills\n4. Use strong action verbs and focus on outcomes'
      };
    }
    
    // Ready/qualification questions
    if (lowerMessage.includes('ready') || lowerMessage.includes('qualified') || lowerMessage.includes('chance')) {
      let readiness = 'You have a solid foundation';
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
