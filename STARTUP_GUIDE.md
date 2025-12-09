# Career Compass - Complete Startup Guide

## 🚀 Quick Start (All Services)

### Option 1: Manual Start (Recommended for Development)

#### 1. Start Backend Server
```powershell
cd C:\Users\Admin\Desktop\career-compass\backend
npm run dev
```
Server runs at: http://localhost:5000

#### 2. Start Frontend Server
```powershell
cd C:\Users\Admin\Desktop\career-compass\frontend
npm run dev
```
App runs at: http://localhost:5173

#### 3. Start AI Service (Optional but Recommended)
```powershell
cd C:\Users\Admin\Desktop\career-compass\ai-service
python -m uvicorn main:app --reload --port 8000
```
AI Service runs at: http://localhost:8000

### Option 2: All-in-One Startup

Open PowerShell and run:
```powershell
cd C:\Users\Admin\Desktop\career-compass

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

# Start AI Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ai-service; python -m uvicorn main:app --reload --port 8000"
```

This opens 3 separate PowerShell windows for each service.

## ✅ What's Implemented

### Frontend (React + Vite) ✅
- ✅ Job description input (textarea)
- ✅ Resume upload and paste functionality
- ✅ Match score visualization with stars
- ✅ Skill gap analysis with priorities
- ✅ Actionable recommendations
- ✅ AI-powered chat interface
- ✅ Responsive design
- ✅ Error handling and loading states

### Backend (Node.js + Express) ✅
- ✅ Resume analysis API
- ✅ Chat functionality
- ✅ History tracking (with MongoDB)
- ✅ Fallback mode (without MongoDB)
- ✅ Error handling and logging
- ✅ CORS configuration
- ✅ Mock data when AI service unavailable

### AI Service (Python + FastAPI) ✅
- ✅ Skill extraction (50+ skills)
- ✅ Match score calculation
- ✅ Gap analysis with categories
- ✅ Recommendation generation
- ✅ Intelligent chat system
- ✅ Works without OpenAI API key!
- ✅ Pattern-based analysis
- ✅ Keyword matching

## 🔗 Service Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend   │────────▶│ AI Service  │
│  (Port 5173)│◀────────│  (Port 5000)│◀────────│ (Port 8000) │
└─────────────┘         └─────────────┘         └─────────────┘
     React                   Express                FastAPI
     + Vite                 + MongoDB              + LangChain
```

## 📊 Current Status

| Component | Status | Port | Notes |
|-----------|--------|------|-------|
| Frontend | ✅ Ready | 5173 | All features working |
| Backend | ✅ Ready | 5000 | Works with/without DB |
| AI Service | ✅ Ready | 8000 | Works with/without OpenAI |
| MongoDB | ⚠️ Optional | 27017 | Not required |

## 🧪 Testing the Complete System

1. **Open Frontend**: http://localhost:5173

2. **Test Analysis**:
   - Paste a job description
   - Paste your resume or upload file
   - Click "Analyze Match"
   - View results in seconds!

3. **Test Chat**:
   - Navigate to Chat tab after analysis
   - Ask questions like:
     - "How can I improve my score?"
     - "What skills should I learn first?"
     - "How do I prepare for interview?"

4. **API Health Checks**:
```powershell
# Backend health
Invoke-WebRequest http://localhost:5000/health

# AI Service health
Invoke-WebRequest http://localhost:8000/health
```

## 🛠️ Features by Service

### Frontend Features
1. **Home Page**
   - Job description textarea
   - Resume upload (drag-drop) OR paste
   - Input validation
   - Loading states

2. **Analysis Page**
   - Match score with visual indicators
   - Skill matches with relevance scores
   - Gap analysis with priority badges
   - Actionable recommendations
   - Top tip highlight

3. **Chat Page**
   - Conversational AI interface
   - Suggested questions
   - Message history
   - Typing indicators

### Backend Features
1. **Analysis Endpoint** (`POST /api/v1/analyze`)
   - Receives resume + JD
   - Calls AI service
   - Returns comprehensive analysis
   - Saves to DB (if available)

2. **Chat Endpoint** (`POST /api/v1/chat`)
   - Context-aware responses
   - Message history
   - Fallback responses

3. **History Endpoint** (`GET /api/v1/history`)
   - List all analyses
   - Filter by user

### AI Service Features
1. **Skill Extraction**
   - 50+ technical skills
   - Programming languages
   - Frameworks & libraries
   - Cloud & DevOps tools
   - Soft skills

2. **Match Scoring**
   - Skill overlap (70%)
   - Content relevance (20%)
   - Experience level (10%)
   - Range: 0-100

3. **Gap Analysis**
   - Technical Skills gaps
   - Tools & Technologies gaps
   - Experience level gaps
   - Priority assignment

4. **Recommendations**
   - High-priority actions
   - Medium-priority improvements
   - Learning suggestions
   - Interview prep tips

5. **Intelligent Chat**
   - Career advice
   - Resume tips
   - Skill learning paths
   - Interview preparation
   - Keyword-based responses

## 💡 Smart Features

### Auto-Fallback System
- AI Service unavailable? → Backend uses mock data
- MongoDB unavailable? → Backend runs without persistence
- OpenAI unavailable? → AI Service uses pattern matching

### No External Dependencies Required!
- Works completely offline (except for real OpenAI)
- Perfect for development
- Fast responses
- Realistic mock data

## 🔧 Troubleshooting

### Port Already in Use
```powershell
# Kill process on specific port
Get-NetTCPConnection -LocalPort 5000 | Stop-Process -Force
Get-NetTCPConnection -LocalPort 5173 | Stop-Process -Force
Get-NetTCPConnection -LocalPort 8000 | Stop-Process -Force
```

### Backend Not Connecting
- Check if running: http://localhost:5000/health
- Restart: `npm run dev` in backend folder

### Frontend Error "Failed to analyze"
- Ensure backend is running
- Check browser console for errors
- Verify CORS settings

### AI Service Not Starting
- Check Python version: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Try different port: `python -m uvicorn main:app --port 8001`

## 📦 Optional Enhancements

### Add MongoDB (for data persistence)
```powershell
# Install MongoDB
choco install mongodb

# Start MongoDB service
net start MongoDB
```

### Add OpenAI API (for real AI)
```powershell
# Edit ai-service/.env
OPENAI_API_KEY=sk-your-key-here
```

## 🎯 Next Steps

1. ✅ **All services are ready!**
2. ✅ **Start all three services**
3. ✅ **Open http://localhost:5173**
4. ✅ **Test the complete workflow**
5. ⭐ **Enjoy Career Compass!**

## 📚 Documentation

- Frontend: `frontend/README.md`
- Backend: `backend/README.md`
- AI Service: `ai-service/README.md`
- API Docs: `docs/api-flow.md`
- Architecture: `docs/architecture.md`

## 🚀 Production Ready

All three services are production-ready with:
- Error handling
- Logging
- Health checks
- Environment configuration
- Fallback mechanisms
- Comprehensive testing

**Career Compass is complete and ready to use! 🎉**
