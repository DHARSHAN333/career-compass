import { SKILL_ENTRIES, DISPLAY_OVERRIDES, STOP_WORDS } from '../constants/skills.js';
import { retrieveRelevantContext } from './knowledgeBase.service.js';
import { generateText, getRuntimeModelInfo } from './llm.service.js';

const canonicalSkill = (skill) => {
  const lower = String(skill || '').toLowerCase().trim();
  if (!lower) return '';
  if (DISPLAY_OVERRIDES[lower]) return DISPLAY_OVERRIDES[lower];
  return skill
    .replace(/\s+/g, ' ')
    .replace(/\bjs\b/i, 'JavaScript')
    .replace(/\bts\b/i, 'TypeScript')
    .trim();
};

const normalizeText = (text = '') =>
  String(text)
    .toLowerCase()
    .replace(/[^\w\s+/.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const wordSet = (text = '') => new Set(normalizeText(text).split(' ').filter((word) => word && !STOP_WORDS.has(word)));

export const extractSkills = (text = '') => {
  if (!text) return [];
  const normalized = normalizeText(text);
  const found = new Map();

  for (const entry of SKILL_ENTRIES) {
    const aliases = [entry.label.toLowerCase(), ...(entry.aliases || [])];
    if (aliases.some((alias) => normalized.includes(alias.toLowerCase()))) {
      found.set(entry.label.toLowerCase(), entry.label);
    }
  }

  const words = text.split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i].replace(/[()\[\],.;:]/g, '');
    if (/^[A-Z]{2,6}$/.test(word) && !['I', 'A'].includes(word)) {
      found.set(word.toLowerCase(), word);
    }

    if (i < words.length - 1) {
      const pair = `${word} ${words[i + 1]}`.replace(/[()\[\],.;:]/g, '').toLowerCase();
      const matched = SKILL_ENTRIES.find((entry) => entry.label.toLowerCase() === pair || (entry.aliases || []).includes(pair));
      if (matched) found.set(matched.label.toLowerCase(), matched.label);
    }
  }

  return [...found.values()].sort((a, b) => a.localeCompare(b));
};

export const findMatchedSkills = (resumeSkills = [], jdSkills = []) => {
  const resumeSet = new Set(resumeSkills.map((skill) => skill.toLowerCase()));
  const matches = new Map();

  for (const jdSkill of jdSkills) {
    const jdLower = jdSkill.toLowerCase();
    for (const resumeSkill of resumeSet) {
      if (
        jdLower === resumeSkill ||
        jdLower.includes(resumeSkill) ||
        resumeSkill.includes(jdLower) ||
        jdLower.replace(/[.\s]/g, '') === resumeSkill.replace(/[.\s]/g, '')
      ) {
        matches.set(jdLower, canonicalSkill(jdSkill));
        break;
      }
    }
  }

  return [...matches.values()].sort((a, b) => a.localeCompare(b));
};

export const findMissingSkills = (resumeSkills = [], jdSkills = []) => {
  const resumeSet = new Set(resumeSkills.map((skill) => skill.toLowerCase()));
  const missing = [];

  for (const jdSkill of jdSkills) {
    const jdLower = jdSkill.toLowerCase();
    const matched = [...resumeSet].some(
      (resumeSkill) =>
        jdLower === resumeSkill ||
        jdLower.includes(resumeSkill) ||
        resumeSkill.includes(jdLower) ||
        jdLower.replace(/[.\s]/g, '') === resumeSkill.replace(/[.\s]/g, '')
    );

    if (!matched) missing.push(canonicalSkill(jdSkill));
  }

  return [...new Set(missing)].sort((a, b) => a.localeCompare(b));
};

const extractYearsExperience = (text = '') => {
  const patterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?experience/i,
    /experience\s+(?:of\s+)?(\d+)\+?\s*years?/i,
    /(\d+)\+?\s*yrs?\s+exp/i
  ];

  for (const pattern of patterns) {
    const match = String(text).match(pattern);
    if (match) return Number(match[1]);
  }

  return 0;
};

const educationMatch = (resume = '', jd = '') => {
  const educationKeywords = new Map([
    ['phd', 10],
    ['ph.d', 10],
    ['doctorate', 10],
    ['master', 8],
    ['msc', 8],
    ['m.s', 8],
    ['mba', 8],
    ['bachelor', 6],
    ['bsc', 6],
    ['b.s', 6],
    ['degree', 5]
  ]);

  const jdEducation = [...educationKeywords.keys()].filter((keyword) => jd.includes(keyword));
  if (!jdEducation.length) return 10;

  const resumeEducation = jdEducation.filter((keyword) => resume.includes(keyword));
  return resumeEducation.length ? 10 : 5;
};

export const calculateMatchScore = (matchedSkills = [], jdSkills = [], resumeText = '', jobDescription = '') => {
  const resumeNormalized = normalizeText(resumeText);
  const jdNormalized = normalizeText(jobDescription);

  if (resumeNormalized && resumeNormalized === jdNormalized) return 100;

  if (resumeNormalized.length > 50 && jdNormalized.length > 50) {
    const resumeWords = wordSet(resumeNormalized);
    const jdWords = wordSet(jdNormalized);
    if (jdWords.size && resumeWords.size) {
      const overlap = [...resumeWords].filter((word) => jdWords.has(word)).length;
      const jdCoverage = overlap / jdWords.size;
      const resumeCoverage = overlap / resumeWords.size;
      const avgSimilarity = (jdCoverage + resumeCoverage) / 2;

      if (avgSimilarity >= 0.95) return 99;
      if (avgSimilarity >= 0.9) return 96;
      if (avgSimilarity >= 0.85) return 92;
    }
  }

  if (!jdSkills?.length) return 50;

  const skillMatchRatio = matchedSkills.length / jdSkills.length;
  let skillScore = skillMatchRatio * 40;
  if (matchedSkills.length >= 10) skillScore = Math.min(skillScore + 5, 40);
  else if (matchedSkills.length >= 7) skillScore = Math.min(skillScore + 3, 40);

  const jdExperience = extractYearsExperience(jobDescription.toLowerCase());
  const resumeExperience = extractYearsExperience(resumeText.toLowerCase());
  let experienceScore = 10;
  if (jdExperience && resumeExperience) {
    if (resumeExperience >= jdExperience) experienceScore = 25;
    else if (resumeExperience >= jdExperience * 0.8) experienceScore = 20;
    else if (resumeExperience >= jdExperience * 0.6) experienceScore = 15;
  } else if (resumeExperience > 0) {
    experienceScore = 20;
  }

  const commonWords = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'will', 'your', 'our', 'their']);
  const jdWords = new Set(jobDescription.toLowerCase().split(/\s+/).filter((word) => word.length > 3 && !commonWords.has(word)));
  const resumeWords = new Set(resumeText.toLowerCase().split(/\s+/).filter((word) => word.length > 3 && !commonWords.has(word)));
  const contentScore = jdWords.size ? (([...jdWords].filter((word) => resumeWords.has(word)).length / jdWords.size) * 20) : 10;

  const educationScore = educationMatch(resumeText.toLowerCase(), jobDescription.toLowerCase());
  const seniorityKeywords = ['senior', 'lead', 'principal', 'staff', 'architect', 'manager', 'director'];
  const jdHasSenior = seniorityKeywords.some((keyword) => jobDescription.toLowerCase().includes(keyword));
  const resumeHasSenior = seniorityKeywords.some((keyword) => resumeText.toLowerCase().includes(keyword));
  let seniorityScore = 5;
  if (jdHasSenior && !resumeHasSenior) seniorityScore = 2;
  else if (jdHasSenior && resumeHasSenior) seniorityScore = 5;

  let finalScore = Math.round(skillScore + experienceScore + contentScore + educationScore + seniorityScore);
  if (!matchedSkills.length) finalScore = Math.min(finalScore, 30);
  else if (matchedSkills.length < 3 && jdSkills.length > 5) finalScore = Math.min(finalScore, 45);

  return Math.min(Math.max(finalScore, 5), 100);
};

export const identifyGaps = (resumeText = '', jobDescription = '', missingSkills = []) => {
  const gaps = [];
  const technicalSkills = ['python', 'javascript', 'java', 'react', 'node.js', 'sql', 'aws', 'typescript', 'docker', 'kubernetes', 'machine learning', 'ai'];
  const tools = ['docker', 'kubernetes', 'git', 'jenkins', 'jira', 'terraform', 'ansible'];
  const frameworks = ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'express'];

  missingSkills.slice(0, 6).forEach((skill, index) => {
    const skillLower = skill.toLowerCase();
    let category = 'Additional Skills';
    let priority = index < 3 ? 'Medium' : 'Low';
    let description = `Would benefit from ${skill} knowledge`;
    let actionable = `Study ${skill} to strengthen your technical profile and increase job match`;

    if (technicalSkills.some((tech) => skillLower.includes(tech))) {
      category = 'Technical Skills';
      priority = index < 2 ? 'High' : 'Medium';
      description = `Lacks ${skill} expertise required for this role`;
      actionable = `Complete a comprehensive ${skill} course and build 2-3 projects to demonstrate proficiency`;
    } else if (frameworks.some((fw) => skillLower.includes(fw))) {
      category = 'Framework Knowledge';
      priority = index < 2 ? 'High' : 'Medium';
      description = `No hands-on experience with ${skill}`;
      actionable = `Learn ${skill} fundamentals and create a portfolio project using this framework`;
    } else if (tools.some((tool) => skillLower.includes(tool))) {
      category = 'Tools & Technologies';
      priority = index < 3 ? 'Medium' : 'Low';
      description = `Missing ${skill} proficiency`;
      actionable = `Gain practical experience with ${skill} through hands-on practice and tutorials`;
    }

    gaps.push({ category, description, priority, actionable });
  });

  const lowerResume = resumeText.toLowerCase();
  const lowerJD = jobDescription.toLowerCase();

  if (lowerJD.includes('senior') && !lowerResume.includes('senior')) {
    gaps.push({
      category: 'Experience Level',
      description: 'Role requires senior-level experience which may not be clearly demonstrated',
      priority: 'High',
      actionable: 'Emphasize leadership initiatives, mentoring experience, and advanced technical contributions in your resume'
    });
  }

  if (['lead', 'manager', 'team lead'].some((keyword) => lowerJD.includes(keyword))) {
    if (!['led', 'managed', 'mentored', 'leadership'].some((keyword) => lowerResume.includes(keyword))) {
      gaps.push({
        category: 'Leadership Experience',
        description: 'Limited evidence of team leadership or management experience',
        priority: 'High',
        actionable: 'Highlight any team projects, mentoring, or technical leadership experiences you have had'
      });
    }
  }

  return gaps.slice(0, 6);
};

export const generateRecommendations = ({ resumeText = '', jobDescription = '', gaps = [], missingSkills = [], detailLevel = 'detailed', includeExamples = true }) => {
  const recommendations = [];
  const maxTips = detailLevel === 'comprehensive' ? 5 : detailLevel === 'detailed' ? 4 : 3;

  if (missingSkills.length) {
    recommendations.push({
      text: `Learn ${missingSkills.slice(0, 3).join(', ')} to better match job requirements${includeExamples ? ' and add one portfolio example for each skill' : ''}`,
      priority: 'High',
      impact: 'High'
    });
  }

  if (!/\d/.test(resumeText.slice(0, 500))) {
    recommendations.push({
      text: 'Add quantifiable achievements (e.g., "Improved performance by 40%")',
      priority: 'High',
      impact: 'High'
    });
  }

  if (!['led', 'developed', 'implemented', 'designed', 'managed', 'created'].some((verb) => resumeText.toLowerCase().includes(verb))) {
    recommendations.push({
      text: 'Use strong action verbs to describe your experience',
      priority: 'Medium',
      impact: 'Medium'
    });
  }

  if (jobDescription.toLowerCase().includes('aws') && missingSkills.some((skill) => skill.toLowerCase().includes('aws'))) {
    recommendations.push({
      text: 'Consider AWS certification to demonstrate cloud expertise',
      priority: 'Medium',
      impact: 'High'
    });
  }

  recommendations.push({
    text: 'Tailor resume to highlight relevant experience for this specific role',
    priority: 'Medium',
    impact: 'Medium'
  });

  return recommendations.slice(0, maxTips);
};

export const generateTopTip = (score, gaps = [], missingSkills = []) => {
  if (score >= 80) {
    return 'Your profile is a strong match! Focus on highlighting your key achievements and impact.';
  }

  if (score >= 60) {
    if (missingSkills.length) {
      return `Strengthen your profile by gaining experience in ${missingSkills.slice(0, 2).join(', ')} to better align with job requirements.`;
    }
    return 'Focus on quantifying your achievements with specific metrics and outcomes.';
  }

  if (missingSkills.length) {
    return `Priority: Learn ${missingSkills[0]} and build relevant projects to demonstrate your capability.`;
  }

  return 'Significant gaps identified. Focus on developing core skills and gaining relevant experience.';
};

const buildAnalysisPrompt = ({ resumeText, jobDescription, matchedSkills, missingSkills, gaps, detailLevel, includeExamples, priorityFocus, ragContext }) => `
You are an expert career counselor and resume analyst.
Return only valid JSON with this exact shape:
{
  "match_score": 0,
  "matched_skills": [{"name": "Python", "relevance": 0.95}],
  "missing_skills": [{"name": "React", "priority": "High", "suggestion": "..."}],
  "gaps": [{"category": "Technical Skills", "description": "...", "priority": "High", "actionable": "..."}],
  "recommendations": [{"text": "...", "priority": "High", "impact": "High"}],
  "top_tip": "...",
  "model": "..."
}

Resume:
${resumeText.slice(0, 4000)}

Job Description:
${jobDescription.slice(0, 4000)}

Matched Skills: ${matchedSkills.slice(0, 10).join(', ')}
Missing Skills: ${missingSkills.slice(0, 10).join(', ')}
Current Gaps: ${gaps.slice(0, 5).map((gap) => `${gap.category}: ${gap.description}`).join(' | ')}

Analysis Detail Level: ${detailLevel}
Priority Focus: ${priorityFocus}
Include Examples: ${includeExamples ? 'yes' : 'no'}

Relevant examples and best practices:
${ragContext || 'No reference examples found.'}
`;

const parseJsonResponse = (text = '') => {
  const cleaned = String(text)
    .trim()
    .replace(/^```json/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
};

export const analyzeResume = async ({
  resumeText,
  jobDescription,
  detailLevel = 'detailed',
  includeExamples = true,
  priorityFocus = 'balanced',
  userConfig = {}
}) => {
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = extractSkills(jobDescription);
  const matchedSkills = findMatchedSkills(resumeSkills, jdSkills);
  const missingSkills = findMissingSkills(resumeSkills, jdSkills);
  const score = calculateMatchScore(matchedSkills, jdSkills, resumeText, jobDescription);
  const baseGaps = identifyGaps(resumeText, jobDescription, missingSkills);
  const baseRecommendations = generateRecommendations({ resumeText, jobDescription, gaps: baseGaps, missingSkills, detailLevel, includeExamples });
  const baseTip = generateTopTip(score, baseGaps, missingSkills);

  const modelInfo = getRuntimeModelInfo(userConfig);
  const ragContext = includeExamples ? await retrieveRelevantContext(`${resumeText.slice(0, 1000)}\n${jobDescription.slice(0, 1000)}\n${priorityFocus}`, 3) : '';

  const llmText = await generateText({
    prompt: buildAnalysisPrompt({
      resumeText,
      jobDescription,
      matchedSkills,
      missingSkills,
      gaps: baseGaps,
      detailLevel,
      includeExamples,
      priorityFocus,
      ragContext
    }),
    systemPrompt: 'Provide concise JSON only. No markdown, no explanations.',
    userConfig,
    temperature: 0.3
  });

  const parsed = llmText ? parseJsonResponse(llmText) : null;

  if (parsed) {
    return {
      matchScore: Number.isFinite(parsed.match_score) ? parsed.match_score : score,
      matchedSkills: Array.isArray(parsed.matched_skills) ? parsed.matched_skills : matchedSkills.map((name) => ({ name, relevance: 0.9 })),
      missingSkills: Array.isArray(parsed.missing_skills) ? parsed.missing_skills : missingSkills.map((name) => ({ name, priority: 'Medium', suggestion: `Learn ${name} to improve your fit` })),
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps : baseGaps,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : baseRecommendations,
      topTip: parsed.top_tip || baseTip,
      model: parsed.model || `${modelInfo.provider}:${modelInfo.model}${includeExamples ? ' + RAG' : ''}`,
      ragUsed: Boolean(ragContext)
    };
  }

  return {
    matchScore: score,
    matchedSkills: matchedSkills.map((name) => ({ name, relevance: 0.9 })),
    missingSkills: missingSkills.map((name) => ({ name, priority: 'Medium', suggestion: `Learn ${name} to improve your fit` })),
    gaps: baseGaps,
    recommendations: baseRecommendations,
    topTip: baseTip,
    model: `${modelInfo.provider === 'mock' ? 'rule-based-v1' : `${modelInfo.provider}:${modelInfo.model}`}${includeExamples ? ' + RAG' : ''}`,
    ragUsed: Boolean(ragContext)
  };
};

const buildChatPrompt = ({ message, context = {}, history = [], ragContext = '' }) => {
  const historyText = history
    .slice(-6)
    .map((item) => `${String(item.role || 'user').toUpperCase()}: ${item.content}`)
    .join('\n');

  return `
You are a helpful career advisor.
Return a helpful answer in plain text.

Context:
Resume: ${context.resumeText || context.resume_text || ''}
Job Description: ${context.jobDescription || context.job_description || ''}
Match Score: ${context.matchScore || context.match_score || 0}
Matched Skills: ${(context.skills?.matched || context.matchedSkills || []).map((skill) => (typeof skill === 'string' ? skill : skill.name)).join(', ')}
Missing Skills: ${(context.skills?.missing || context.missingSkills || []).map((skill) => (typeof skill === 'string' ? skill : skill.name)).join(', ')}
Gaps: ${(context.gaps || []).map((gap) => `${gap.category}: ${gap.description}`).join(' | ')}
Recommendations: ${(context.recommendations || []).map((rec) => rec.text || rec).join(' | ')}

Relevant examples and best practices:
${ragContext || 'No reference examples found.'}

Conversation History:
${historyText || 'No history.'}

User Message:
${message}
`;
};

const generateMockChatResponse = (message, context = {}) => {
  const lowerMessage = String(message).toLowerCase();
  const matchScore = Number(context.matchScore || context.match_score || 0);
  const matchedSkills = context.skills?.matched || context.matchedSkills || [];
  const missingSkills = context.skills?.missing || context.missingSkills || [];
  const resumeText = context.resumeText || context.resume_text || '';

  if (/^(hi|hello|hey|greetings)[\s!?]*$/i.test(message.trim())) {
    if (matchScore > 0) {
      const skillsList = matchedSkills.slice(0, 3).map((skill) => (typeof skill === 'string' ? skill : skill.name)).join(', ');
      return `Hello! I've reviewed your resume and job match analysis. Your match score is ${matchScore}%.${skillsList ? ` Your top skills include: ${skillsList}.` : ''} What would you like to know?`;
    }
    return 'Hello! I can help with resume analysis, skill gaps, career advice, and interview preparation. What would you like to know?';
  }

  if (['skill', 'learn', 'priorit', 'study', 'what skills'].some((word) => lowerMessage.includes(word))) {
    const strong = matchedSkills.slice(0, 5).map((skill) => (typeof skill === 'string' ? skill : skill.name));
    const weak = missingSkills.slice(0, 3).map((skill) => (typeof skill === 'string' ? skill : skill.name));
    return [
      strong.length ? `Your strong skills: ${strong.join(', ')}` : '',
      weak.length ? `Skills to learn first: ${weak.join(', ')}` : '',
      'Focus on one missing skill at a time, build a project, then update your resume with measurable outcomes.'
    ].filter(Boolean).join('\n\n');
  }

  if (['improve', 'better', 'stronger', 'enhance', 'resume'].some((word) => lowerMessage.includes(word))) {
    const firstLines = resumeText ? `Looking at your profile: "${resumeText.slice(0, 120)}..."\n\n` : '';
    return `${firstLines}Add quantifiable achievements, use action verbs, include relevant keywords from the job description, and highlight any missing skills with projects or certifications.`;
  }

  if (['ready', 'qualified', 'chance', 'fit', 'strong'].some((word) => lowerMessage.includes(word))) {
    const readiness = matchScore >= 80
      ? `Excellent news! Your ${matchScore}% match score shows you're highly qualified.`
      : matchScore >= 60
        ? `Good news! Your ${matchScore}% match score shows a solid foundation.`
        : `Your ${matchScore}% match score indicates some skill gaps to address.`;

    const weak = missingSkills.slice(0, 3).map((skill) => (typeof skill === 'string' ? skill : skill.name));
    return `${readiness}${weak.length ? `\n\nSkills to develop: ${weak.join(', ')}` : ''}`;
  }

  if (['experience', 'project', 'highlight', 'showcase'].some((word) => lowerMessage.includes(word))) {
    return 'Use the STAR method: Situation, Task, Action, Result. Describe what you did, which tools you used, and the measurable outcome.';
  }

  if (['interview', 'prepare'].some((word) => lowerMessage.includes(word))) {
    return 'Research the company, review the job description, prepare STAR stories, practice technical questions, and prepare concise examples of impact.';
  }

  return `Based on your analysis, focus on the highest-priority gaps and use your strongest skills to tailor the resume. If you want, I can break down the next steps for ${matchScore}% match. ${resumeText ? 'Your current profile already provides useful context.' : ''}`;
};

export const chatAboutAnalysis = async ({ message, context = {}, history = [], userConfig = {} }) => {
  const modelInfo = getRuntimeModelInfo(userConfig);
  const ragContext = await retrieveRelevantContext(
    `${context.resumeText || context.resume_text || ''}\n${context.jobDescription || context.job_description || ''}\n${message}`,
    3
  );

  const llmText = await generateText({
    prompt: buildChatPrompt({ message, context, history, ragContext }),
    systemPrompt: 'Be specific, practical, and grounded in the provided context.',
    userConfig,
    temperature: 0.4
  });

  if (llmText?.trim()) {
    return { response: llmText.trim(), model: `${modelInfo.provider}:${modelInfo.model}${ragContext ? ' + RAG' : ''}` };
  }

  return {
    response: generateMockChatResponse(message, context),
    model: `${modelInfo.provider === 'mock' ? 'rule-based-v1' : `${modelInfo.provider}:${modelInfo.model}`}${ragContext ? ' + RAG' : ''}`
  };
};

