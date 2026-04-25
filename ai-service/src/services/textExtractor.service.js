import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';

const isTextFile = (filename = '', mimetype = '') =>
  filename.toLowerCase().endsWith('.txt') || mimetype === 'text/plain';

const isPdf = (filename = '', mimetype = '') =>
  filename.toLowerCase().endsWith('.pdf') || mimetype === 'application/pdf';

const isDocx = (filename = '', mimetype = '') =>
  filename.toLowerCase().endsWith('.docx') || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const isImage = (filename = '', mimetype = '') =>
  ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif', '.webp'].some((ext) => filename.toLowerCase().endsWith(ext)) ||
  mimetype.startsWith('image/');

const extractFromImage = async (buffer, filename) => {
  const tempPath = path.join(os.tmpdir(), `career-compass-${Date.now()}-${filename}`);
  await fs.writeFile(tempPath, buffer);

  try {
    const worker = await createWorker('eng');
    const result = await worker.recognize(tempPath);
    await worker.terminate();
    return (result?.data?.text || '').trim();
  } finally {
    await fs.unlink(tempPath).catch(() => {});
  }
};

export const extractTextFromBuffer = async (buffer, filename = 'file', mimetype = '') => {
  if (!buffer?.length) return '';

  if (isTextFile(filename, mimetype)) {
    return buffer.toString('utf8').trim();
  }

  if (isPdf(filename, mimetype)) {
    const data = await pdfParse(buffer);
    const text = (data?.text || '').trim();
    if (text) return text;
  }

  if (isDocx(filename, mimetype)) {
    const result = await mammoth.extractRawText({ buffer });
    return (result?.value || '').trim();
  }

  if (isImage(filename, mimetype)) {
    return extractFromImage(buffer, filename);
  }

  throw new Error(`Unsupported file type: ${filename}`);
};

export const extractTextFromBase64 = async (base64Content, fileType = 'pdf') => {
  const cleanBase64 = base64Content.includes(',') ? base64Content.split(',')[1] : base64Content;
  const buffer = Buffer.from(cleanBase64, 'base64');
  const extension = fileType.toLowerCase();
  return extractTextFromBuffer(buffer, `file.${extension}`, extension.startsWith('image') ? extension : '');
};