import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UploadResume from '../../components/UploadResume.jsx';
import PasteJD from '../../components/PasteJD.jsx';
import Loader from '../../components/common/Loader.jsx';
import { analyzeResume } from '../../services/api.js';

function Home() {
  const { isAuthenticated } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      setError('Please login to analyze your resume');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Validation
    if (!resumeText || !jobDescription) {
      setError('Please provide both resume and job description');
      return;
    }

    if (resumeText.length < 50) {
      setError('Resume text is too short. Please provide a complete resume.');
      return;
    }

    if (jobDescription.length < 50) {
      setError('Job description is too short. Please provide a complete job description.');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const result = await analyzeResume(resumeText, jobDescription);
      // Store the analysis in session storage for immediate access
      sessionStorage.setItem('currentAnalysis', JSON.stringify(result));
      navigate(`/analysis/${result.analysisId}`);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError('Failed to analyze. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResumeText('');
    setJobDescription('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Career Compass
        </h1>
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          AI-Powered Resume Analysis
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Discover how well your resume matches job requirements with our advanced AI technology.
          Get instant feedback, gap analysis, and personalized recommendations.
        </p>
        {!isAuthenticated && (
          <div className="flex gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-lg transition-all"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Analysis Section - Only show if authenticated */}
      {isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* Input Container */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Job Description Section */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span>📋</span>
                  <span>Step 1: Paste Job Description</span>
                </h3>
                <span className="badge badge-primary">Required</span>
              </div>
              <PasteJD value={jobDescription} onChange={setJobDescription} />
              {jobDescription && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {jobDescription.length} characters
                </p>
              )}
            </div>

            {/* Resume Section */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span>📄</span>
                  <span>Step 2: Upload or Paste Your Resume</span>
                </h3>
                <span className="badge badge-primary">Required</span>
              </div>
              <UploadResume onTextExtracted={setResumeText} />
              {resumeText && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {resumeText.length} characters
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <button 
              onClick={handleClear}
              className="btn-secondary"
              disabled={loading}
            >
              Clear All
            </button>
            <button 
              onClick={handleAnalyze} 
              disabled={loading || !resumeText || !jobDescription}
              className="btn-primary text-lg px-8"
            >
              {loading ? '🔍 Analyzing...' : '🚀 Analyze Match'}
            </button>
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md mx-4 shadow-2xl">
                <Loader text="Analyzing your resume against the job description..." />
                <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
                  Our AI is comparing skills, experience, and qualifications
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Features Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white dark:bg-gray-800">
        <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
          Powerful Features to Boost Your Career
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700 hover:shadow-lg transition-all">
            <div className="text-5xl mb-4">⭐</div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Match Score</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Get an instant percentage-based rating showing how well your resume aligns with the job requirements
            </p>
          </div>
          <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700 hover:shadow-lg transition-all">
            <div className="text-5xl mb-4">🔍</div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Gap Analysis</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Discover missing skills, tools, and experiences that could make your application stronger
            </p>
          </div>
          <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700 hover:shadow-lg transition-all">
            <div className="text-5xl mb-4">💡</div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Smart Recommendations</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Receive specific, actionable suggestions to optimize your resume for maximum impact
            </p>
          </div>
          <div className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700 hover:shadow-lg transition-all">
            <div className="text-5xl mb-4">💬</div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">AI Career Coach</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Chat with our AI assistant for personalized career advice and interview preparation tips
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
          How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Upload & Paste</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Simply paste the job description and upload your resume (PDF, DOC, or paste text)
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">AI Analysis</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Our advanced AI analyzes your resume against the job requirements in seconds
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Get Results</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Receive detailed insights, match scores, and personalized recommendations instantly
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Land Your Dream Job?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who have improved their resumes with Career Compass
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 text-lg font-semibold text-blue-600 bg-white hover:bg-gray-100 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              Start Your Free Analysis
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
