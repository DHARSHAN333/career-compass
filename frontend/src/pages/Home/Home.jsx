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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-96 h-96 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl"></div>
          </div>
          <div className="relative">
            <h1 className="text-7xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 tracking-tight">
              Career Compass
            </h1>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              AI-Powered Resume Intelligence
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Transform your job search with cutting-edge AI analysis. Get instant match scores,
              comprehensive skill assessments, and strategic recommendations tailored to your career goals.
            </p>
            {!isAuthenticated && (
              <div className="flex gap-5 justify-center mb-16">
                <Link
                  to="/register"
                  className="group px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-2xl transition-all transform hover:scale-105 hover:shadow-blue-500/50"
                >
                  <span className="flex items-center gap-2">
                    Get Started Free
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
                <Link
                  to="/login"
                  className="px-10 py-4 text-lg font-bold text-gray-800 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-xl transition-all border-2 border-gray-200 dark:border-gray-700"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Section - Only show if authenticated */}
      {isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Error Message */}
          {error && (
            <div className="mb-8 p-5 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-l-4 border-red-600 rounded-xl shadow-lg">
              <p className="text-red-900 dark:text-red-200 flex items-center gap-3 font-semibold">
                <span className="text-2xl">⚠️</span>
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* Input Container */}
          <div className="grid lg:grid-cols-2 gap-8 mb-10">
            {/* Job Description Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="text-3xl">📋</span>
                  <span>Job Description</span>
                </h3>
                <span className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">STEP 1</span>
              </div>
              <PasteJD value={jobDescription} onChange={setJobDescription} />
              {jobDescription && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                    ✓ {jobDescription.length} characters captured
                  </p>
                </div>
              )}
            </div>

            {/* Resume Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="text-3xl">📄</span>
                  <span>Your Resume</span>
                </h3>
                <span className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">STEP 2</span>
              </div>
              <UploadResume onTextExtracted={setResumeText} />
              {resumeText && (
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                    ✓ {resumeText.length} characters captured
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 mb-16">
            <button 
              onClick={handleClear}
              className="px-8 py-4 text-lg font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl shadow-lg transition-all border-2 border-gray-300 dark:border-gray-600"
              disabled={loading}
            >
              Clear All
            </button>
            <button 
              onClick={handleAnalyze} 
              disabled={loading || !resumeText || !jobDescription}
              className="px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 rounded-xl shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-purple-500/50"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                '🚀 Analyze Resume Match'
              )}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-slate-900 rounded-3xl shadow-2xl my-16">
        <div className="text-center mb-16">
          <h3 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Powerful Features for Your Success
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to land your dream job
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group relative text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">⭐</div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Match Score</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Instant AI-powered analysis showing your compatibility with job requirements
            </p>
          </div>
          <div className="group relative text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">🔍</div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Gap Analysis</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Identify missing skills and qualifications to strengthen your application
            </p>
          </div>
          <div className="group relative text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">📊</div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Skill Assessment</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Comprehensive breakdown of matched and missing technical competencies
            </p>
          </div>
          <div className="group relative text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">💬</div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Career Coach</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Get personalized career guidance and strategic recommendations
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-5xl font-extrabold text-center text-gray-900 dark:text-white mb-6">
          Simple. Fast. Powerful.
        </h3>
        <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-16 max-w-2xl mx-auto">
          Get professional resume analysis in three easy steps
        </p>
        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connection lines */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600"></div>
          
          <div className="relative text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-transform">
              1
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Upload Documents</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Paste the job description and upload your resume in any format (PDF, DOC, or plain text)
            </p>
          </div>
          <div className="relative text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-transform">
              2
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Processing</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Advanced AI algorithms analyze your qualifications against job requirements in real-time
            </p>
          </div>
          <div className="relative text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-transform">
              3
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Actionable Insights</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Receive comprehensive analysis with match scores, gap identification, and strategic recommendations
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-16 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-20"></div>
            <div className="relative z-10">
              <h3 className="text-5xl font-extrabold text-white mb-6">
                Ready to Accelerate Your Career?
              </h3>
              <p className="text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
                Join professionals worldwide who trust Career Compass for intelligent resume optimization
              </p>
              <Link
                to="/register"
                className="inline-block px-12 py-5 text-xl font-bold text-indigo-700 bg-white hover:bg-gray-50 rounded-xl shadow-2xl transition-all transform hover:scale-105 hover:shadow-white/30"
              >
                <span className="flex items-center gap-3">
                  Start Your Free Analysis
                  <span className="text-2xl">→</span>
                </span>
              </Link>
              <p className="mt-6 text-blue-200 text-sm">
                No credit card required • Instant results • 100% secure
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
