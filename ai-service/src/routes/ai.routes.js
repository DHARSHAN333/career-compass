import express from 'express';
import multer from 'multer';
import { analyzeResume, chatAboutAnalysis } from '../services/analysis.service.js';
import { extractTextFromBuffer, extractTextFromBase64 } from '../services/textExtractor.service.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const readUserConfig = (body = {}) => ({
  apiKey: body.user_api_key || body.userApiKey || '',
  provider: body.user_provider || body.userProvider || '',
  model: body.user_model || body.userModel || ''
});

const readAnalysisSettings = (body = {}) => ({
  detailLevel: body.detail_level || body.detailLevel || body.analysisSettings?.detailLevel || 'detailed',
  includeExamples: body.include_examples ?? body.includeExamples ?? body.analysisSettings?.includeExamples ?? true,
  priorityFocus: body.priority_focus || body.priorityFocus || body.analysisSettings?.priorityFocus || 'balanced'
});

router.get('/', (_req, res) => {
  res.json({ message: 'Career Compass AI Service', status: 'running' });
});

router.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'ai-service-node' });
});

router.post('/analyze', async (req, res, next) => {
  try {
    const resumeText = req.body.resume_text || req.body.resumeText || '';
    const jobDescription = req.body.job_description || req.body.jobDescription || '';
    const userConfig = readUserConfig(req.body);
    const analysisSettings = readAnalysisSettings(req.body);

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Both resume_text and job_description are required' });
    }

    const result = await analyzeResume({
      resumeText,
      jobDescription,
      ...analysisSettings,
      userConfig
    });

    return res.json({
      match_score: result.matchScore,
      matched_skills: result.matchedSkills,
      missing_skills: result.missingSkills,
      gaps: result.gaps,
      recommendations: result.recommendations,
      top_tip: result.topTip,
      model: result.model,
      rag_used: result.ragUsed || false
    });
  } catch (error) {
    next(error);
  }
});

router.post('/chat', async (req, res, next) => {
  try {
    const { message = '', context = {}, history = [] } = req.body;
    const userConfig = readUserConfig(req.body);

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const result = await chatAboutAnalysis({ message, context, history, userConfig });
    return res.json({ response: result.response, model: result.model });
  } catch (error) {
    next(error);
  }
});

router.post('/extract', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'file is required' });
    }

    const text = await extractTextFromBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
    return res.json({ text: text || '' });
  } catch (error) {
    next(error);
  }
});

router.post('/extract-base64', async (req, res, next) => {
  try {
    const base64 = req.body.file || req.body.file_content || req.body.fileContent || '';
    const fileType = req.body.file_type || req.body.fileType || 'pdf';

    if (!base64) {
      return res.status(400).json({ error: 'file is required' });
    }

    const text = await extractTextFromBase64(base64, fileType);
    return res.json({ text: text || '' });
  } catch (error) {
    next(error);
  }
});

export default router;