# Career Compass AI Service

## Python AI Service for Resume Analysis

This service provides intelligent resume analysis using NLP and pattern matching.

### Features
- ✅ Skill extraction from resumes and job descriptions
- ✅ Match score calculation with multiple factors
- ✅ Gap analysis with categorization and priorities
- ✅ Actionable recommendations
- ✅ Intelligent chat/Q&A system
- ✅ Works with or without OpenAI API key

### Setup

#### 1. Install Python Dependencies
```bash
cd ai-service
pip install -r requirements.txt
```

#### 2. Configure Environment (Optional)
```bash
# Copy .env and add your OpenAI API key (optional)
cp .env .env.local

# Edit .env.local and add:
OPENAI_API_KEY=sk-your-key-here
```

**Note**: The service works without an API key using intelligent pattern matching!

#### 3. Start the Service
```bash
# Windows
python -m uvicorn main:app --reload --port 8000

# Or simply
python main.py
```

The service will be available at: http://localhost:8000

### API Endpoints

#### Analyze Resume
```http
POST /api/analyze
Content-Type: application/json

{
  "resume_text": "Your resume text here...",
  "job_description": "Job description text here..."
}
```

Response:
```json
{
  "match_score": 75,
  "matched_skills": [
    {"name": "Python", "relevance": 0.95},
    {"name": "React", "relevance": 0.88}
  ],
  "missing_skills": [
    {
      "name": "AWS",
      "priority": "High",
      "suggestion": "Consider learning AWS..."
    }
  ],
  "gaps": [
    {
      "category": "Technical Skills",
      "description": "Missing AWS expertise",
      "priority": "High",
      "actionable": "Complete AWS certification"
    }
  ],
  "recommendations": [
    {
      "text": "Add quantifiable achievements",
      "priority": "High",
      "impact": "High"
    }
  ],
  "top_tip": "Focus on quantifying your achievements...",
  "model": "gpt-3.5-turbo"
}
```

#### Chat
```http
POST /api/chat
Content-Type: application/json

{
  "message": "How can I improve my resume?",
  "context": {
    "resume_text": "...",
    "job_description": "...",
    "match_score": 75
  },
  "history": []
}
```

Response:
```json
{
  "response": "To improve your resume match score...",
  "model": "gpt-3.5-turbo"
}
```

### Architecture

```
ai-service/
├── main.py                 # FastAPI application entry
├── requirements.txt        # Python dependencies
├── .env                   # Environment configuration
└── app/
    ├── router.py          # API endpoints
    ├── schemas/           # Request/Response models
    │   ├── requests.py
    │   └── responses.py
    ├── pipelines/         # Analysis logic
    │   ├── extract_skills.py
    │   ├── scoring.py
    │   ├── gap_analysis.py
    │   └── tip_generator.py
    └── clients/
        └── llm_client.py  # LLM integration
```

### Skill Detection

The service recognizes 50+ skills including:

**Programming**: Python, JavaScript, Java, C++, TypeScript, etc.
**Web**: React, Angular, Vue, Node.js, Django, Flask, etc.
**Cloud**: AWS, Azure, GCP, Docker, Kubernetes, etc.
**Data**: SQL, MongoDB, Redis, Pandas, NumPy, etc.
**Tools**: Git, Jira, Jenkins, etc.

### Scoring Algorithm

Match score is calculated using:
- **70%** Skill overlap between resume and JD
- **20%** Keyword relevance and content match
- **10%** Experience level indicators

### Gap Analysis

Gaps are categorized into:
- Technical Skills (High priority)
- Tools & Technologies (Medium priority)
- Additional Skills (Low priority)
- Experience Level mismatches

Each gap includes:
- Category
- Description
- Priority (High/Medium/Low)
- Actionable suggestion

### Intelligent Chat

The chat system provides:
- Career advice
- Resume improvement tips
- Skill learning recommendations
- Interview preparation guidance
- Salary negotiation insights

Works with pattern matching even without OpenAI API!

### Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test analyze endpoint
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "Software engineer with 3 years experience in Python and React",
    "job_description": "Looking for Senior Python Developer"
  }'

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How can I improve my match score?",
    "context": {}
  }'
```

### Integration with Backend

The Node.js backend calls this service at:
```
http://localhost:8000/api/analyze
http://localhost:8000/api/chat
```

If the AI service is unavailable, the backend automatically uses its own mock data.

### No OpenAI Key? No Problem!

The service includes:
- Pattern-based skill extraction
- Rule-based scoring
- Template-based recommendations
- Keyword-based chat responses

Perfect for development and testing!

### Production Deployment

For production with OpenAI:
1. Add your API key to `.env`
2. Set `LLM_MODEL=gpt-4` for better results
3. Increase rate limits as needed
4. Monitor API usage

### Troubleshooting

**Port already in use:**
```bash
# Change port in .env or command line
python -m uvicorn main:app --port 8001
```

**Import errors:**
```bash
pip install -r requirements.txt --upgrade
```

**OpenAI errors:**
- Check API key is valid
- Service falls back to pattern matching automatically

### Next Steps

1. ✅ Service is ready to use!
2. Start the service: `python main.py`
3. Backend will connect automatically
4. Test with frontend at http://localhost:5173

Enjoy Career Compass AI! 🎯🚀
