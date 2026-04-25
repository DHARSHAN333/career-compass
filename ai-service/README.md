# Career Compass AI Service (Node.js)

This folder is now fully Node.js and powers the AI endpoints used by the backend.

## Run

1. Install dependencies:

```bash
cd ai-service
npm install
```

2. Start service:

```bash
npm start
```

Service URL: http://localhost:8000

## Endpoints

- `GET /api/health`
- `POST /api/analyze`
- `POST /api/chat`
- `POST /api/extract`
- `POST /api/extract-base64`

## Features kept

- Resume vs JD analysis
- Skill extraction and scoring
- Gap analysis and recommendations
- Contextual chat
- RAG-style context retrieval from local knowledge base
- File extraction for PDF / DOCX / image OCR / base64 uploads

## Key folders

- `src/routes/ai.routes.js` — API routes
- `src/services/analysis.service.js` — analysis + chat logic
- `src/services/knowledgeBase.service.js` — local RAG retrieval
- `src/services/textExtractor.service.js` — file and OCR extraction
- `src/services/llm.service.js` — OpenAI/Gemini adapter
- `data/knowledge_base/` — retrieval documents

## Notes

- Backend integration remains the same (`AI_SERVICE_URL=http://localhost:8000`).
- If no external LLM key is configured, the service uses rule-based fallback logic and still returns valid responses.
