import Analysis from '../models/Analysis.model.js';
import mongoose from 'mongoose';
import aiClient from '../services/aiClient.service.js';
import logger from '../utils/logger.js';

export const analyzeResume = async (req, res, next) => {
  try {
    const { 
      resumeText, 
      jobDescription, 
      userApiKey, 
      userProvider, 
      userModel, 
      autoSave = true,
      analysisSettings = {} 
    } = req.body;
    const userId = req.user._id; // Get from authenticated user

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Both resumeText and jobDescription are required'
      });
    }

    // Extract analysis settings with defaults
    const { 
      detailLevel = 'detailed',
      includeExamples = true,
      priorityFocus = 'balanced'
    } = analysisSettings;

    logger.info('Starting resume analysis', { 
      autoSave, 
      detailLevel, 
      includeExamples, 
      priorityFocus 
    });

    // Prepare user config if provided
    const userConfig = userApiKey ? {
      apiKey: userApiKey,
      provider: userProvider || 'gemini',
      model: userModel
    } : undefined;

    // Prepare analysis configuration
    const analysisConfig = {
      detailLevel,
      includeExamples,
      priorityFocus
    };

    // Call AI service for analysis
    const startTime = Date.now();
    const analysisResult = await aiClient.analyze(resumeText, jobDescription, userConfig, analysisConfig);
    const processingTime = Date.now() - startTime;

    const analysisData = {
      userId: userId,
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
        version: '1.0',
        analysisSettings: {
          detailLevel,
          includeExamples,
          priorityFocus
        }
      }
    };

    let analysis;
    let analysisId = 'temp-' + Date.now();
    let saved = false;

    // Only save to database if autoSave is enabled AND database is connected
    if (autoSave && mongoose.connection.readyState === 1) {
      try {
        analysis = await Analysis.create(analysisData);
        analysisId = analysis._id;
        saved = true;
        logger.info(`Analysis saved to database: ${analysisId}`);
      } catch (dbError) {
        logger.warn('Failed to save to database:', dbError.message);
        analysis = { ...analysisData, _id: analysisId, createdAt: new Date() };
      }
    } else {
      if (!autoSave) {
        logger.info('AutoSave disabled - analysis not persisted to database');
      } else {
        logger.info('Database not connected - returning analysis without persistence');
      }
      analysis = { ...analysisData, _id: analysisId, createdAt: new Date() };
    }

    res.status(201).json({
      success: true,
      analysisId: analysisId,
      saved: saved,
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
    const { analysisId, message, context, history, userApiKey, userProvider, userModel } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Use context from request body (preferred) or fetch from database
    let analysisContext = context || {
      jobDescription: '',
      resumeText: '',
      matchScore: 0,
      gaps: [],
      skills: { matched: [], missing: [] },
      recommendations: []
    };

    // If no context provided and analysisId exists, try to fetch from database
    if (!context && analysisId && mongoose.connection.readyState === 1) {
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

    logger.info('Chat request:', {
      hasResumeText: !!analysisContext.resumeText,
      hasJobDescription: !!analysisContext.jobDescription,
      matchScore: analysisContext.matchScore,
      resumeLength: analysisContext.resumeText?.length || 0,
      historyLength: history?.length || 0,
      hasUserKey: !!userApiKey
    });

    // Prepare user config if provided
    const userConfig = userApiKey ? {
      apiKey: userApiKey,
      provider: userProvider || 'gemini',
      model: userModel
    } : undefined;

    // Call AI service for chat with actual context, history, and user config
    const chatResponse = await aiClient.chat({
      message,
      context: analysisContext,
      history: history || [],
      userConfig
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
    const userId = req.user._id; // Get from authenticated user
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        success: false,
        error: 'Database not available. Analysis history is not persisted in demo mode.' 
      });
    }

    // Only allow users to access their own analyses
    const analysis = await Analysis.findOne({ _id: id, userId });

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
    const userId = req.user._id; // Get from authenticated user

    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'Database not available. No history in demo mode.'
      });
    }

    const analyses = await Analysis.find({ userId })
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
