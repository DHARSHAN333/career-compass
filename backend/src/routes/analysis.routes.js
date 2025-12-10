import express from 'express';
import { 
  analyzeResume, 
  chatWithAnalysis, 
  getAnalysisById,
  getUserAnalyses 
} from '../controllers/analysis.controller.js';
import validateRequest from '../middleware/validateRequest.js';
import authenticate from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/v1/analyze - Analyze resume against job description (Protected)
router.post('/analyze', authenticate, validateRequest, analyzeResume);

// POST /api/v1/chat - Chat about an analysis (Protected)
router.post('/chat', authenticate, validateRequest, chatWithAnalysis);

// GET /api/v1/analysis/:id - Get analysis by ID (Protected)
router.get('/analysis/:id', authenticate, getAnalysisById);

// GET /api/v1/history - Get all analyses (Protected)
router.get('/history', authenticate, getUserAnalyses);

export default router;
