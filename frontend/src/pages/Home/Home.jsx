import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadResume from '../../components/UploadResume.jsx';
import PasteJD from '../../components/PasteJD.jsx';
import Loader from '../../components/common/Loader.jsx';
import { analyzeResume } from '../../services/api.js';

function Home() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async () => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          🎯 Career Compass
        </h1>
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
          AI-Powered Resume Analysis
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Get instant feedback on how well your resume matches the job requirements
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </p>
        </div>
      )}

      {/* Input Container */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 mb-8">
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
      <div className="max-w-7xl mx-auto flex justify-center gap-4 mb-12">
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

      {/* Features Info */}
      <div className="max-w-7xl mx-auto mt-16">
        <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
          What You'll Get:
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6 text-center hover:scale-105 transition-transform">
            <span className="text-4xl mb-3 block">⭐</span>
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Match Score</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Visual rating of how well your resume matches the job
            </p>
          </div>
          <div className="card p-6 text-center hover:scale-105 transition-transform">
            <span className="text-4xl mb-3 block">🔍</span>
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Gap Analysis</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Identify missing skills, tools, and experiences
            </p>
          </div>
          <div className="card p-6 text-center hover:scale-105 transition-transform">
            <span className="text-4xl mb-3 block">💡</span>
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Actionable Tips</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Get specific suggestions to improve your resume
            </p>
          </div>
          <div className="card p-6 text-center hover:scale-105 transition-transform">
            <span className="text-4xl mb-3 block">💬</span>
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">AI Chat Support</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Ask questions and get instant career advice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
