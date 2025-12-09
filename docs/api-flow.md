# API Flow Documentation

## Endpoints Overview

### Frontend → Backend

#### POST /api/v1/analyze
Initiate resume analysis against job description

**Request:**
```json
{
  "resumeText": "string",
  "jobDescription": "string",
  "userId": "string (optional)"
}
```

**Response:**
```json
{
  "analysisId": "string",
  "score": 85,
  "gaps": ["skill1", "skill2"],
  "tips": ["tip1", "tip2"],
  "extractedSkills": ["skill1", "skill2"],
  "matchedSkills": ["skill1"]
}
```

#### POST /api/v1/chat
Ask follow-up questions about analysis

**Request:**
```json
{
  "analysisId": "string",
  "message": "string"
}
```

**Response:**
```json
{
  "response": "string"
}
```

### Backend → AI Service

#### POST /v1/analyze
Process resume and JD for analysis

#### POST /v1/chat
Handle conversational queries

#### POST /v1/extract
Extract text from resume file

## Flow Diagram

```
User → Frontend → Backend → AI Service → LLM
                     ↓
                  MongoDB
```

## Error Handling

- 400: Bad Request (validation errors)
- 401: Unauthorized
- 500: Internal Server Error
- 503: AI Service Unavailable
