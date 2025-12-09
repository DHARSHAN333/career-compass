import express from 'express';
import { 
  analyzeResume, 
  chatWithAnalysis, 
  getAnalysisById,
  getUserAnalyses 
} from '../controllers/analysis.controller.js';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

// POST /api/v1/analyze - Analyze resume against job description
router.post('/analyze', validateRequest, analyzeResume);

// POST /api/v1/chat - Chat about an analysis
router.post('/chat', validateRequest, chatWithAnalysis);

// GET /api/v1/analysis/:id - Get analysis by ID
router.get('/analysis/:id', getAnalysisById);

// GET /api/v1/history - Get all analyses (optional: filtered by user)
router.get('/history', getUserAnalyses);

export default router;
