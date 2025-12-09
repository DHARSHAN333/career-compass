import Analysis from '../models/Analysis.model.js';
import logger from '../utils/logger.js';

const historyService = {
  /**
   * Save analysis to database
   */
  async saveAnalysis(analysisData) {
    try {
      const analysis = new Analysis(analysisData);
      await analysis.save();
      logger.info(`Analysis saved with ID: ${analysis._id}`);
      return analysis;
    } catch (error) {
      logger.error('Error saving analysis:', error);
      throw error;
    }
  },

  /**
   * Get analysis by ID
   */
  async getAnalysisById(id) {
    try {
      return await Analysis.findById(id);
    } catch (error) {
      logger.error('Error fetching analysis:', error);
      throw error;
    }
  },

  /**
   * Get all analyses for a user
   */
  async getUserAnalyses(userId, limit = 10) {
    try {
      return await Analysis.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error fetching user analyses:', error);
      throw error;
    }
  },

  /**
   * Delete analysis
   */
  async deleteAnalysis(id) {
    try {
      return await Analysis.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error deleting analysis:', error);
      throw error;
    }
  }
};

export default historyService;
