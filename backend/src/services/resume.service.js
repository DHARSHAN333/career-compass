import logger from '../utils/logger.js';

const resumeService = {
  /**
   * Extract text from resume (wrapper for various formats)
   */
  async extractText(file) {
    // In a real implementation, this would use libraries like pdf-parse, mammoth, etc.
    logger.info('Extracting text from resume');
    
    // Placeholder implementation
    return file.buffer.toString('utf-8');
  },

  /**
   * Normalize resume text for analysis
   */
  normalizeText(text) {
    // Remove extra whitespace, normalize line breaks
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  },

  /**
   * Extract basic info from resume (name, email, etc.)
   */
  extractBasicInfo(text) {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex = /(\+\d{1,3}[- ]?)?\d{10}/;

    return {
      email: text.match(emailRegex)?.[0] || null,
      phone: text.match(phoneRegex)?.[0] || null
    };
  }
};

export default resumeService;
