import dotenv from 'dotenv';

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8000),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  useRag: String(process.env.USE_RAG || 'true').toLowerCase() === 'true',
  vectorStorePath: process.env.VECTOR_STORE_PATH || './data/vectorstore',
  ragTopK: Number(process.env.RAG_TOP_K || 3),
  llmProvider: String(process.env.LLM_PROVIDER || 'gemini').toLowerCase(),
  llmModel: process.env.LLM_MODEL || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  googleApiKey: process.env.GOOGLE_API_KEY || ''
};

export default config;