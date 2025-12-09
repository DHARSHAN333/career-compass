# Career Compass - Quick Start Guide

## 🚀 Running the Application

### Backend Server (Port 5000)

```powershell
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`
- **Note**: MongoDB is optional - the backend runs in fallback mode without it
- Health check: `http://localhost:5000/health`

### Frontend Application (Port 5173)

```powershell
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📋 Current Status

✅ **Frontend**: Fully implemented with all 5 features
- Job description and resume input (file upload + paste)
- Match score with visual rating
- Gap analysis with priority indicators
- Actionable tips
- Natural language AI chat

✅ **Backend**: Complete API server
- Resume analysis endpoint
- Chat functionality
- History tracking
- Error handling and logging
- Mock data mode (works without AI service)

⚠️ **Database**: Running without MongoDB (fallback mode)
- Analysis data not persisted
- Install MongoDB to enable full features

⚠️ **AI Service**: Not running (optional)
- Backend returns mock data when AI service unavailable
- Python FastAPI service can be started separately

## 🔗 API Endpoints

### Analysis
- `POST /api/v1/analyze` - Analyze resume against job description
- `GET /api/v1/analysis/:id` - Get specific analysis
- `GET /api/v1/history` - Get all analyses

### Chat
- `POST /api/v1/chat` - Send message about an analysis

## 🧪 Testing the Application

1. Open `http://localhost:5173` in your browser
2. Enter a job description or paste one
3. Upload your resume or paste the text
4. Click "Analyze Match" to see results
5. Try the chat feature to ask questions

## 📊 Mock Data

When the AI service is not available, the backend provides realistic mock data:
- Match score: ~72%
- Sample skill gaps
- Generic recommendations
- Chat responses based on keywords

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/career-compass
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api/v1
```

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Kill process on port 5000
Get-NetTCPConnection -LocalPort 5000 | Stop-Process -Force

# Kill process on port 5173
Get-NetTCPConnection -LocalPort 5173 | Stop-Process -Force
```

### MongoDB Connection Error
- The backend will still run in fallback mode
- Install MongoDB or use a cloud service like MongoDB Atlas

### AI Service Connection Error
- The backend automatically uses mock data
- This is expected if the Python AI service isn't running

## 📦 Next Steps

1. **Install MongoDB** (optional but recommended)
   - Download from: https://www.mongodb.com/try/download/community
   - Start service: `net start MongoDB`

2. **Set up AI Service** (optional)
   ```powershell
   cd ai-service
   pip install -r requirements.txt
   python -m uvicorn main:app --reload
   ```

3. **Add OpenAI API Key** (for AI service)
   - Create `ai-service/.env`
   - Add: `OPENAI_API_KEY=your-key-here`

## ✨ Features Working Now

- ✅ Job description input (text area)
- ✅ Resume upload and paste functionality
- ✅ Match score calculation and display
- ✅ Skill gap analysis with priorities
- ✅ Actionable recommendations
- ✅ AI chat interface (with mock responses)
- ✅ Responsive UI with modern design
- ✅ Error handling and loading states

Enjoy using Career Compass! 🎯
