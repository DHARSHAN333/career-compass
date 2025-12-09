import Analysis from '../models/Analysis.model.js';
import mongoose from 'mongoose';
import aiClient from '../services/aiClient.service.js';
import logger from '../utils/logger.js';

export const analyzeResume = async (req, res, next) => {
  try {
    const { resumeText, jobDescription, userId } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Both resumeText and jobDescription are required'
      });
    }

    logger.info('Starting resume analysis');

    // Call AI service for analysis
    const startTime = Date.now();
    const analysisResult = await aiClient.analyze(resumeText, jobDescription);
    const processingTime = Date.now() - startTime;

    const analysisData = {
      userId: userId || 'anonymous',
      jobDescription,
      resumeText,
      matchScore: analysisResult.matchScore || 75,
      skills: {
        matched: analysisResult.matchedSkills || [],
        missing: analysisResult.missingSkills || []
      },
      gaps: analysisResult.gaps || [],
      recommendations: analysisResult.recommendations || [],
      topTip: analysisResult.topTip || 'Focus on highlighting your relevant experience',
      status: 'completed',
      metadata: {
        processingTime,
        aiModel: analysisResult.model || 'gpt-3.5-turbo',
        version: '1.0'
      }
    };

    let analysis;
    let analysisId = 'mock-' + Date.now();

    // Try to save to database if connected
    if (mongoose.connection.readyState === 1) {
      try {
        analysis = await Analysis.create(analysisData);
        analysisId = analysis._id;
        logger.info(`Analysis created successfully: ${analysisId}`);
      } catch (dbError) {
        logger.warn('Failed to save to database, using in-memory mode:', dbError.message);
        analysis = { ...analysisData, _id: analysisId, createdAt: new Date() };
      }
    } else {
      logger.info('Database not connected, returning analysis without persistence');
      analysis = { ...analysisData, _id: analysisId, createdAt: new Date() };
    }

    res.status(201).json({
      success: true,
      analysisId: analysisId,
      matchScore: analysisData.matchScore,
      skills: analysisData.skills,
      gaps: analysisData.gaps,
      recommendations: analysisData.recommendations,
      topTip: analysisData.topTip,
      createdAt: analysis.createdAt || new Date()
    });

  } catch (error) {
    logger.error('Analysis error:', error);
    next(error);
  }
};

export const chatWithAnalysis = async (req, res, next) => {
  try {
    const { analysisId, message } = req.body;

    if (!analysisId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Both analysisId and message are required'
      });
    }

    // Try to get analysis context from database or session
    let analysisContext = {
      jobDescription: '',
      resumeText: '',
      matchScore: 0,
      gaps: [],
      skills: { matched: [], missing: [] },
      recommendations: []
    };

    // Try to fetch from database if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const analysis = await Analysis.findById(analysisId);
        if (analysis) {
          analysisContext = {
            jobDescription: analysis.jobDescription || '',
            resumeText: analysis.resumeText || '',
            matchScore: analysis.matchScore || 0,
            gaps: analysis.gaps || [],
            skills: analysis.skills || { matched: [], missing: [] },
            recommendations: analysis.recommendations || []
          };
        }
      } catch (err) {
        logger.warn('Could not fetch analysis from DB:', err.message);
      }
    }

    // Call AI service for chat with actual context
    const chatResponse = await aiClient.chat({
      message,
      context: analysisContext,
      history: []
    });

    res.json({ 
      success: true,
      response: chatResponse.response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Chat error:', error);
    next(error);
  }
};

export const getAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false,
        error: 'Database not available. Analysis history is not persisted in demo mode.' 
      });
    }

    const analysis = await Analysis.findById(id);

    if (!analysis) {
      return res.status(404).json({ 
        success: false,
        error: 'Analysis not found' 
      });
    }

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error('Get analysis error:', error);
    next(error);
  }
};

export const getUserAnalyses = async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'Database not available. No history in demo mode.'
      });
    }

    const analyses = await Analysis.find(
      userId ? { userId } : {}
    )
      .sort({ createdAt: -1 })
      .limit(50)
      .select('-resumeText -jobDescription -chatHistory');

    res.json({
      success: true,
      data: analyses,
      count: analyses.length
    });

  } catch (error) {
    logger.error('Get analyses error:', error);
    next(error);
  }
};
