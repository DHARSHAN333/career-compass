import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';

const resolveProvider = (userConfig = {}) => String(userConfig.provider || config.llmProvider || 'mock').toLowerCase();

const resolveModel = (userConfig = {}) => {
  if (userConfig.model) return userConfig.model;
  if (config.llmModel) return config.llmModel;
  return resolveProvider(userConfig) === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash';
};

export const getRuntimeModelInfo = (userConfig = {}) => {
  const provider = resolveProvider(userConfig);
  const model = resolveModel(userConfig);
  return { provider, model };
};

export const generateText = async ({ prompt, systemPrompt = '', userConfig = {}, temperature = 0.4 }) => {
  const provider = resolveProvider(userConfig);
  const model = resolveModel(userConfig);
  const apiKey = userConfig.apiKey || config.openaiApiKey || config.googleApiKey;

  if (!apiKey || provider === 'mock') return null;

  if (provider === 'openai') {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model,
      temperature,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ]
    });

    return response.choices?.[0]?.message?.content || '';
  }

  const client = new GoogleGenerativeAI(apiKey);
  const genModel = client.getGenerativeModel({ model });
  const combinedPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
  const result = await genModel.generateContent(combinedPrompt);
  return result?.response?.text?.() || '';
};