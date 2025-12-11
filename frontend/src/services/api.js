import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const analyzeResume = async (resumeText, jobDescription) => {
  // Get user AI config from localStorage
  const useCustomAI = localStorage.getItem('useCustomAI') === 'true';
  const userApiKey = useCustomAI ? localStorage.getItem('userApiKey') : null;
  const userProvider = useCustomAI ? localStorage.getItem('aiProvider') : null;
  const userModel = useCustomAI ? localStorage.getItem('userModel') : null;
  
  // Get autoSave preference
  const autoSave = localStorage.getItem('autoSave') !== 'false'; // default true
  
  // Get analysis settings from localStorage
  const detailLevel = localStorage.getItem('detailLevel') || 'detailed';
  const includeExamples = localStorage.getItem('includeExamples') !== 'false'; // default true
  const priorityFocus = localStorage.getItem('priorityFocus') || 'balanced';

  const requestBody = {
    resumeText,
    jobDescription,
    autoSave, // Include autoSave setting
    analysisSettings: {
      detailLevel,
      includeExamples,
      priorityFocus
    }
  };

  // Add user config if they're using custom AI
  if (useCustomAI && userApiKey) {
    requestBody.userApiKey = userApiKey;
    requestBody.userProvider = userProvider;
    requestBody.userModel = userModel;
  }

  const response = await api.post('/analyze', requestBody);
  return response.data;
};

export const getAnalysis = async (analysisId) => {
  const response = await api.get(`/analysis/${analysisId}`);
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const sendChatMessage = async (analysisId, message, context, history = []) => {
  // Get user AI config from localStorage
  const useCustomAI = localStorage.getItem('useCustomAI') === 'true';
  const userApiKey = useCustomAI ? localStorage.getItem('userApiKey') : null;
  const userProvider = useCustomAI ? localStorage.getItem('aiProvider') : null;
  const userModel = useCustomAI ? localStorage.getItem('userModel') : null;

  const requestBody = {
    analysisId,
    message,
    context,
    history
  };

  // Add user config if they're using custom AI
  if (useCustomAI && userApiKey) {
    requestBody.userApiKey = userApiKey;
    requestBody.userProvider = userProvider;
    requestBody.userModel = userModel;
  }

  const response = await api.post('/chat', requestBody);
  return response.data;
};

export default api;
