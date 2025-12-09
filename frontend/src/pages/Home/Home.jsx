import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadResume from '../../components/UploadResume.jsx';
import PasteJD from '../../components/PasteJD.jsx';
import Loader from '../../components/common/Loader.jsx';
import { analyzeResume } from '../../services/api.js';
import styles from './Home.module.css';

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
    <div className={styles.home}>
      <div className={styles.header}>
        <h1>🎯 Career Compass</h1>
        <h2>AI-Powered Resume Analysis</h2>
        <p className={styles.subtitle}>
          Get instant feedback on how well your resume matches the job requirements
        </p>
      </div>

      {error && (
        <div className={styles.errorBox}>
          ⚠️ {error}
        </div>
      )}

      <div className={styles.inputContainer}>
        {/* Job Description Section */}
        <div className={styles.inputSection}>
          <div className={styles.sectionHeader}>
            <h3>📋 Step 1: Paste Job Description</h3>
            <span className={styles.badge}>Required</span>
          </div>
          <PasteJD value={jobDescription} onChange={setJobDescription} />
          {jobDescription && (
            <p className={styles.charCount}>
              {jobDescription.length} characters
            </p>
          )}
        </div>

        {/* Resume Section */}
        <div className={styles.inputSection}>
          <div className={styles.sectionHeader}>
            <h3>📄 Step 2: Upload or Paste Your Resume</h3>
            <span className={styles.badge}>Required</span>
          </div>
          <UploadResume onTextExtracted={setResumeText} />
          {resumeText && (
            <p className={styles.charCount}>
              {resumeText.length} characters
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button 
          onClick={handleClear}
          className={styles.clearButton}
          disabled={loading}
        >
          Clear All
        </button>
        <button 
          onClick={handleAnalyze} 
          disabled={loading || !resumeText || !jobDescription}
          className={styles.analyzeButton}
        >
          {loading ? '🔍 Analyzing...' : '🚀 Analyze Match'}
        </button>
      </div>

      {loading && (
        <div className={styles.loadingOverlay}>
          <Loader text="Analyzing your resume against the job description..." />
          <p className={styles.loadingSubtext}>
            Our AI is comparing skills, experience, and qualifications
          </p>
        </div>
      )}

      {/* Features Info */}
      <div className={styles.features}>
        <h3>What You'll Get:</h3>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>⭐</span>
            <h4>Match Score</h4>
            <p>Visual rating of how well your resume matches the job</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔍</span>
            <h4>Gap Analysis</h4>
            <p>Identify missing skills, tools, and experiences</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>💡</span>
            <h4>Actionable Tips</h4>
            <p>Get specific suggestions to improve your resume</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>💬</span>
            <h4>AI Chat Support</h4>
            <p>Ask questions and get instant career advice</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
