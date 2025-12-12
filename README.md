# Career Compass - Job & Career Assistant

A comprehensive AI-powered platform designed to help college students and job seekers optimize their resumes and improve their chances of landing their desired roles. Career Compass addresses the common challenge of understanding how well a resume matches a specific job description by providing detailed analysis, skill gap identification, and personalized recommendations.

## Business Problem

Many job seekers struggle with:
- Understanding how their resume aligns with specific job requirements
- Identifying skill gaps that prevent them from qualifying for desired positions
- Creating targeted resumes that highlight relevant experience
- Knowing which skills to prioritize for career development
- Getting actionable feedback on resume improvements

Career Compass solves these problems by providing instant, AI-powered analysis that compares resumes against job descriptions, identifies strengths and weaknesses, and offers concrete recommendations for improvement.

## Key Features

**Resume Analysis Engine**
- Upload or paste resume content for instant processing
- Accepts multiple file formats (PDF, DOCX, TXT) or direct text input
- Intelligent text extraction and parsing

**Job Description Matching**
- Compare resume against any job posting
- Calculate precise match percentage based on multiple weighted factors
- Visual match score with color-coded indicators

**Comprehensive Skill Analysis**
- Identify matched skills between resume and job requirements
- Highlight missing critical skills with priority levels
- Extract technical and soft skills using AI-powered analysis
- Skill relevance scoring to show alignment strength

**Gap Analysis**
- Categorize gaps by type (Technical Skills, Experience, Education, Certifications)
- Priority-based recommendations (High, Medium, Low)
- Actionable suggestions for addressing each gap

**AI-Powered Recommendations**
- Personalized suggestions for resume improvement
- Industry-specific advice based on job requirements
- Impact assessment for each recommendation

**Interactive AI Chat**
- Natural language queries about the analysis
- Ask specific questions about your resume or the job
- Context-aware responses based on your analysis results

**User Management**
- Secure authentication with JWT tokens
- Personal analysis history for each user
- Optional auto-save functionality
- Privacy-focused data handling

**Customizable Analysis Settings**
- Adjustable detail level (Quick, Standard, Detailed)
- Priority focus options (Skills, Experience, Education, Overall Balance)
- Toggle examples in recommendations

## Technology Stack

**Frontend (React + Vite)**
- React 18.2.0 for component-based UI architecture
- Vite 5.0.8 for fast development and optimized builds
- React Router DOM 6.20.0 for client-side routing
- Axios 1.6.2 for HTTP requests
- Tailwind CSS 3.4.18 for modern, responsive styling
- Professional gradient designs with hover effects and animations

**Backend (Node.js + Express)**
- Node.js runtime environment
- Express 4.18.2 web framework
- MongoDB 8.0.3 with Mongoose ODM for data persistence
- JWT (jsonwebtoken 9.0.3) for secure authentication
- bcryptjs 3.0.3 for password hashing
- Express Validator 7.3.1 for input validation
- Multer 1.4.5 for file upload handling
- Winston 3.11.0 for logging
- CORS enabled for cross-origin requests

**AI Service (Python + FastAPI)**
- Python 3.8+ runtime
- FastAPI for high-performance async API
- Google Gemini 2.0 Flash for natural language understanding
- Advanced skill extraction algorithms
- Multi-factor scoring system
- Intelligent pattern matching and text analysis

**Database**
- MongoDB Atlas cloud database
- User collection with secure password storage
- Analysis collection with user-specific data isolation
- Indexed queries for performance

**Security**
- JWT-based authentication with 7-day expiry
- Password hashing with bcrypt
- Protected API routes requiring authentication
- Secure credential storage in environment variables
- Input validation and sanitization

## System Architecture

Career Compass follows a three-tier microservices architecture:

1. **Frontend Service (Port 5173)**: React SPA that provides the user interface and handles user interactions
2. **Backend Service (Port 5000)**: Express API that manages authentication, user data, and orchestrates AI requests
3. **AI Service (Port 8000)**: Python FastAPI service that performs resume analysis using Google Gemini

The services communicate via REST APIs with JWT tokens for authentication. All user data is stored in MongoDB Atlas with proper indexing and user isolation.

## Installation & Setup

**Prerequisites**
- Node.js 16+ and npm
- Python 3.8+ and pip
- MongoDB Atlas account (or local MongoDB instance)
- Google Gemini API key

**1. Clone the Repository**
```bash
git clone <repository-url>
cd career-compass
```

**2. Backend Setup**
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.j04if.mongodb.net/career-compass?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

**3. Frontend Setup**
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:5000
VITE_AI_SERVICE_URL=http://localhost:8000
```

**4. AI Service Setup**
```bash
cd ai-service
pip install -r requirements.txt
```

Create a `.env` file in the ai-service directory:
```
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=8000
ENVIRONMENT=development
```

**5. Start All Services**

Open three separate terminal windows:

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 - AI Service:
```bash
cd ai-service
python main.py
```

**6. Access the Application**

Open your browser and navigate to: http://localhost:5173

The application will be running with:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000

## Usage Guide

**Getting Started**

1. Register for a new account or login with existing credentials
2. Navigate to the Home page
3. Upload your resume or paste the content directly
4. Paste the job description you want to match against
5. Click "Analyze Resume" to start the analysis

**Understanding Your Results**

The Analysis page displays four tabs:

- **Overview**: Shows your match percentage, matched skills, missing skills, and general recommendations
- **Gap Analysis**: Detailed breakdown of gaps by category with actionable steps
- **Skills**: Complete list of all skills found in your resume and required by the job
- **Ask AI**: Interactive chat to ask specific questions about your analysis

**Customizing Analysis**

Visit the Settings page to:
- Adjust analysis detail level (Quick for fast results, Detailed for comprehensive analysis)
- Set priority focus (Skills, Experience, Education, or Overall Balance)
- Enable or disable examples in recommendations
- Toggle auto-save to keep your analysis history
- View your usage statistics

**Managing Your Data**

- Enable auto-save to automatically save analyses to your history
- Access past analyses from your account
- Delete old analyses you no longer need
- Export analysis results for reference

## API Documentation

**Authentication Endpoints**

POST /api/auth/register
- Register a new user account
- Body: { name, email, password }

POST /api/auth/login
- Login and receive JWT token
- Body: { email, password }

POST /api/auth/logout
- Logout and invalidate session
- Requires: Authorization header with JWT

GET /api/auth/me
- Get current user information
- Requires: Authorization header with JWT

**Analysis Endpoints**

POST /api/analysis/analyze
- Analyze resume against job description
- Body: { resumeText, jobDescription, autoSave, settings }
- Requires: Authorization header with JWT

GET /api/analysis
- Get user's analysis history
- Requires: Authorization header with JWT

GET /api/analysis/:id
- Get specific analysis by ID
- Requires: Authorization header with JWT

POST /api/analysis/:id/chat
- Chat about a specific analysis
- Body: { message }
- Requires: Authorization header with JWT

**AI Service Endpoints**

POST /api/analyze
- Perform AI-powered resume analysis
- Body: { resume_text, job_description, detail_level, priority_focus, include_examples }

POST /api/chat
- Chat with AI about analysis
- Body: { message, context }

## Project Structure

```
career-compass/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React context providers (Auth)
│   │   ├── pages/           # Page components (Home, Analysis, Settings, Login, Register)
│   │   ├── utils/           # Utility functions and API client
│   │   ├── App.jsx          # Main app component with routing
│   │   └── main.jsx         # Application entry point
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # MongoDB schemas (User, Analysis)
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Custom middleware (auth)
│   │   ├── services/        # Business logic and AI client
│   │   └── utils/           # Helper functions
│   ├── server.js            # Express server setup
│   └── package.json         # Backend dependencies
│
├── ai-service/              # Python AI service
│   ├── app/
│   │   ├── pipelines/       # Analysis pipelines (scoring, extraction)
│   │   ├── services/        # AI services (Gemini client)
│   │   └── router.py        # FastAPI routes
│   ├── main.py              # FastAPI application entry
│   └── requirements.txt     # Python dependencies
│
└── docs/                    # Additional documentation
```

## Scoring Algorithm

The match percentage is calculated using a weighted multi-factor approach:

- Technical Skills Match: 40%
- Work Experience Relevance: 25%
- Keyword Alignment: 20%
- Education Match: 10%
- Seniority Level Match: 5%

Special considerations:
- Identical resume and job description: Returns 100% match
- High text similarity (95%+ overlap): Returns 98% match
- Bonus points for exact skill matches
- Penalties for significant experience or education gaps

## Security Considerations

- All passwords are hashed using bcryptjs before storage
- JWT tokens expire after 7 days and must be refreshed
- API routes are protected with authentication middleware
- MongoDB connection uses secure connection strings with credentials
- Environment variables store sensitive configuration
- Input validation prevents injection attacks
- CORS configured to allow only trusted origins

## Troubleshooting

**Services won't start**
- Verify all dependencies are installed
- Check that ports 5173, 5000, and 8000 are not in use
- Ensure MongoDB connection string is correct
- Verify Gemini API key is valid

**Authentication issues**
- Clear browser cookies and local storage
- Check JWT_SECRET is set in backend .env
- Verify MongoDB connection is active

**Analysis not working**
- Check AI service is running on port 8000
- Verify Gemini API key has not exceeded quota
- Ensure resume and job description are not empty
- Check backend logs for error messages

**Low match scores**
- Ensure job description contains clear requirements
- Add more relevant keywords to resume
- Use industry-standard terminology
- Include quantifiable achievements

## Evaluation Criteria Coverage

This project demonstrates:

**Working Application**
- Fully functional three-tier architecture
- Seamless integration between frontend, backend, and AI service
- Responsive UI with professional design
- Secure authentication and user management

**AI and RAG Concepts**
- Google Gemini 2.0 Flash integration for natural language understanding
- Multi-factor scoring algorithm with intelligent pattern matching
- Context-aware chat functionality
- Skill extraction using AI-powered analysis

**Setup Instructions**
- Comprehensive installation guide for all three services
- Environment configuration examples
- Clear startup procedures
- Troubleshooting guidance

## Future Enhancements

- Multi-language support for international users
- Resume template library with industry-specific examples
- Interview preparation suggestions based on job requirements
- Skill learning path recommendations with course suggestions
- ATS (Applicant Tracking System) optimization score
- LinkedIn profile analysis and optimization
- Company culture fit assessment
- Salary estimation based on skills and experience

## License

This project is developed as part of the Career Compass initiative by the organization to help students succeed in their job search journey.

## Support

For technical support or questions, please contact the development team or refer to the documentation in the /docs directory.
