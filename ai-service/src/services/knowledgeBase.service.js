import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { STOP_WORDS } from '../constants/skills.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_BASE = path.resolve(__dirname, '../../data/knowledge_base');

let cachedDocs = null;

const normalize = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^\w\s+/.-]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word && !STOP_WORDS.has(word));

const scoreQueryAgainstDoc = (query, docText) => {
  const queryWords = new Set(normalize(query));
  const docWords = new Set(normalize(docText));
  if (!queryWords.size || !docWords.size) return 0;

  let overlap = 0;
  for (const word of queryWords) {
    if (docWords.has(word)) overlap += 1;
  }

  return overlap / Math.max(queryWords.size, 1);
};

const loadKnowledgeBase = async () => {
  if (cachedDocs) return cachedDocs;

  const docs = [];
  const sampleResumes = path.join(DEFAULT_BASE, 'sample_resumes');
  const jobTemplates = path.join(DEFAULT_BASE, 'job_templates');
  const bestPractices = path.join(DEFAULT_BASE, 'best_practices');

  const addTextFiles = async (folder, type) => {
    try {
      const files = await fs.readdir(folder);
      for (const file of files) {
        const fullPath = path.join(folder, file);
        const stats = await fs.stat(fullPath);
        if (!stats.isFile()) continue;

        if (file.endsWith('.txt')) {
          const content = await fs.readFile(fullPath, 'utf8');
          const role = path.basename(file, '.txt').replace(/_/g, ' ');
          const scoreMatch = file.match(/_(\d+)$/);
          docs.push({ content, metadata: { role, type, score: scoreMatch?.[1] || 'N/A', filename: file } });
        } else if (file.endsWith('.json') && type === 'best_practice') {
          const json = JSON.parse(await fs.readFile(fullPath, 'utf8'));
          for (const [category, items] of Object.entries(json)) {
            if (Array.isArray(items)) {
              docs.push({
                content: `${category.toUpperCase()}\n${items.map((item) => `• ${item}`).join('\n')}`,
                metadata: { role: category, type, score: 'N/A', filename: file }
              });
            } else if (items && typeof items === 'object') {
              const lines = [];
              for (const [subCategory, subItems] of Object.entries(items)) {
                lines.push(`${subCategory}:`);
                if (Array.isArray(subItems)) {
                  lines.push(...subItems.map((item) => `• ${item}`));
                }
              }
              docs.push({
                content: `${category.toUpperCase()}\n${lines.join('\n')}`,
                metadata: { role: category, type, score: 'N/A', filename: file }
              });
            }
          }
        }
      }
    } catch {
      // Ignore missing folders in development
    }
  };

  await addTextFiles(sampleResumes, 'sample_resume');
  await addTextFiles(jobTemplates, 'job_template');
  await addTextFiles(bestPractices, 'best_practice');

  cachedDocs = docs;
  return docs;
};

export const retrieveRelevantContext = async (query, topK = 3) => {
  const docs = await loadKnowledgeBase();
  if (!docs.length) return '';

  const ranked = docs
    .map((doc) => ({ ...doc, score: scoreQueryAgainstDoc(query, doc.content) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return ranked
    .map((doc, index) => `Example ${index + 1} - ${doc.metadata.role} (${doc.metadata.type}, Score: ${doc.metadata.score}):\n${doc.content.slice(0, 900)}\n`)
    .join('\n---\n');
};