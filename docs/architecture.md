# Career Compass Architecture

## System Overview

Career Compass is a three-tier application for resume analysis and career guidance.

## Architecture Components

### 1. Frontend (React + Vite)
- User interface for uploading resumes and job descriptions
- Interactive results display with scores, gaps, and tips
- Real-time chat interface for follow-up questions
- History tracking of previous analyses

### 2. Backend (Node.js + Express)
- RESTful API gateway
- Request validation and orchestration
- MongoDB integration for data persistence
- Authentication and session management
- File upload and processing

### 3. AI Service (Python + FastAPI)
- LLM-powered analysis engine
- Resume parsing and skill extraction
- Gap analysis between resume and job requirements
- Scoring and recommendation generation
- Chat interface for career advice

### 4. Database (MongoDB)
- User profiles
- Analysis history
- Resume and JD storage
- Session data

## Data Flow

1. User uploads resume + job description via frontend
2. Frontend sends data to backend API
3. Backend validates and forwards to AI service
4. AI service processes with LLM and returns structured results
5. Backend stores results in MongoDB
6. Frontend displays interactive results

## Technology Choices

- **React + Vite**: Fast development, modern tooling
- **Express**: Lightweight, flexible API framework
- **FastAPI**: High-performance Python API with async support
- **LangChain**: Simplified LLM orchestration and prompt management
- **MongoDB**: Flexible schema for varied resume formats
