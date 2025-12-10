# Authentication Setup Guide

## Overview
Career Compass now includes a complete authentication system with Login and Register functionality.

## Features Implemented

### Backend (Node.js/Express)
- ✅ User model with MongoDB/Mongoose
- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Input validation with express-validator
- ✅ Protected API routes
- ✅ Auth middleware

### Frontend (React)
- ✅ Login page with validation
- ✅ Register page with regex validation:
  - Username: 3-30 characters
  - Email: Valid email format (unique)
  - Phone: 10-digit number (unique)
  - Password: Minimum 6 characters
  - Confirm password match
- ✅ Authentication context (AuthContext)
- ✅ Protected routes (require login)
- ✅ Navbar with Login/Register/Logout
- ✅ Enhanced landing page

## MongoDB Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. **IMPORTANT**: Add your IP address to the whitelist:
   - In Atlas dashboard, go to "Network Access"
   - Click "Add IP Address"
   - Either add your current IP or click "Allow Access from Anywhere" (0.0.0.0/0)
7. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/career-compass?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB
1. Install MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - Windows: MongoDB should start automatically as a service
   - Or run: `mongod` in terminal
3. The app is already configured for local MongoDB in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/career-compass
   ```

## Running the Application

### 1. Start Backend
```bash
cd backend
npm install  # Install all dependencies
node server.js
```

Backend runs on http://localhost:5000

### 2. Start Frontend
```bash
cd frontend
npm install  # Install all dependencies
npm run dev
```

Frontend runs on http://localhost:5173

### 3. Start AI Service (Optional - for chat feature)
```bash
cd ai-service
python main.py
```

AI service runs on http://localhost:8000

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (requires auth)
- `POST /api/v1/auth/logout` - Logout user

### Protected Routes (Require JWT Token)
- `POST /api/v1/analyze` - Analyze resume
- `POST /api/v1/chat` - Chat with AI
- `GET /api/v1/history` - Get analysis history
- `GET /api/v1/analysis/:id` - Get specific analysis

## User Flow

1. **New User**:
   - Visit home page → Click "Register" or "Get Started Free"
   - Fill registration form (username, email, phone, password)
   - Automatic login after registration
   - Redirected to home page (now shows analysis tools)

2. **Returning User**:
   - Click "Login" in navbar
   - Enter email and password
   - Access all features after login

3. **Resume Analysis** (Protected):
   - Must be logged in
   - Upload/paste resume and job description
   - Click "Analyze Match"
   - View detailed results with AI chat

## Validation Rules

### Register Form
- **Username**: 
  - Required, 3-30 characters
  - Unique in database
- **Email**: 
  - Valid email format (regex: `/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/`)
  - Unique in database
- **Contact Number**: 
  - Exactly 10 digits (regex: `/^[0-9]{10}$/`)
  - Unique in database
- **Password**: 
  - Minimum 6 characters
- **Confirm Password**: 
  - Must match password

### Login Form
- **Email**: Valid email required
- **Password**: Required

## Security Features

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens with 7-day expiration
- Authorization header: `Bearer <token>`
- Protected routes check authentication
- Passwords never sent in responses
- CORS configured for frontend origin

## Frontend Components

### New Components
- `src/contexts/AuthContext.jsx` - Authentication state management
- `src/pages/Auth/Login.jsx` - Login page
- `src/pages/Auth/Register.jsx` - Registration page
- `src/components/ProtectedRoute.jsx` - Route protection wrapper

### Updated Components
- `src/App.jsx` - Now includes auth routes and Navbar
- `src/pages/Home/Home.jsx` - Enhanced landing page with conditional rendering

## Troubleshooting

### MongoDB Connection Issues
**Error**: "Could not connect to any servers in your MongoDB Atlas cluster"
**Solution**: 
- Check if your IP is whitelisted in MongoDB Atlas Network Access
- Or use local MongoDB instead

### Frontend Can't Connect to Backend
**Error**: Network errors or CORS issues
**Solution**:
- Ensure backend is running on port 5000
- Check CORS_ORIGIN in backend/.env matches frontend URL
- Clear browser cache/cookies

### JWT Token Invalid
**Error**: "Invalid or expired token"
**Solution**:
- Login again to get a new token
- Check JWT_SECRET is consistent in backend/.env
- Token expires after 7 days

## Testing the Authentication

### Test Registration
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "contactNumber": "1234567890",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Protected Route
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Next Steps

1. **Whitelist Your IP** in MongoDB Atlas (if using cloud)
2. **Start All Services** (backend, frontend, AI service)
3. **Register** a new account
4. **Test Resume Analysis** with login required
5. **Check History** page to see saved analyses (future feature)

## Environment Variables Reference

### backend/.env
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/career-compass
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=<your-secret-key>
UPLOAD_DIR=./uploads
```

---

**Note**: The JWT_SECRET is already configured in your .env file. Keep it secret and change it in production!
