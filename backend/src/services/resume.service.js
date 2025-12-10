import logger from '../utils/logger.js';
import axios from 'axios';
import FormData from 'form-data';
import config from '../config/index.js';

const AI_SERVICE_BASE_URL = config.aiServiceUrl;

const resumeService = {
  /**
   * Extract text from resume using AI service (supports PDF, DOCX, images with OCR)
   */
  async extractText(file) {
    try {
      logger.info(`Extracting text from ${file.originalname} using AI service`);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });
      
      // Send to AI service for text extraction
      const response = await axios.post(
        `${AI_SERVICE_BASE_URL}/api/extract`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 60000, // 60 seconds for OCR processing
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );
      
      if (!response.data || !response.data.text) {
        throw new Error('No text extracted from file');
      }
      
      logger.info('Text extraction successful');
      return response.data.text;
      
    } catch (error) {
      logger.error('Text extraction error:', error.message);
      
      // Fallback: try to read as plain text
      if (file.mimetype === 'text/plain') {
        return file.buffer.toString('utf-8');
      }
      
      throw new Error('Failed to extract text from resume. Please ensure the file is a valid PDF, DOCX, or image file.');
    }
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
