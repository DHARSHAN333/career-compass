import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScoreCard from '../../components/ScoreCard.jsx';
import GapList from '../../components/GapList.jsx';
import TipCard from '../../components/TipCard.jsx';
import ChatBox from '../../components/ChatBox.jsx';
import Loader from '../../components/common/Loader.jsx';
import { getAnalysis } from '../../services/api.js';

function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    try {
      // Try to get from session storage first
      const cached = sessionStorage.getItem('currentAnalysis');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.analysisId === id) {
          setAnalysis(data);
          setLoading(false);
          return;
        }
      }

      // Otherwise fetch from API
      const data = await getAnalysis(id);
      setAnalysis(data);
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    navigate('/');
  };

  const getMatchLevel = (score) => {
    if (score >= 80) return { level: 'Strong Match', color: '#28a745', stars: 5 };
    if (score >= 60) return { level: 'Good Match', color: '#ffc107', stars: 3 };
    return { level: 'Needs Improvement', color: '#dc3545', stars: 2 };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader text="Loading your analysis..." />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">❌ Analysis not found</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">The requested analysis could not be found or has expired.</p>
          <button onClick={handleNewAnalysis} className="btn-primary">
            ← Start New Analysis
          </button>
        </div>
      </div>
    );
  }

  // Normalize the data structure
  const matchScore = analysis.matchScore || analysis.score || 0;
  const matchedSkills = analysis.skills?.matched || analysis.matchedSkills || [];
  const missingSkills = analysis.skills?.missing || analysis.gaps || [];
  const gaps = analysis.gaps || [];
  const recommendations = analysis.recommendations || analysis.tips || [];
  const topTip = analysis.topTip || (recommendations.length > 0 ? recommendations[0].text : '');

  const matchInfo = getMatchLevel(matchScore);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button onClick={handleNewAnalysis} className="btn-secondary mb-4">
          ← New Analysis
        </button>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">📊 Resume Analysis Results</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyzed on {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Match Score - Prominent Display */}
      <div className="max-w-7xl mx-auto mb-8">
        <ScoreCard score={matchScore} matchInfo={matchInfo} />
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2 border-b border-gray-300 dark:border-gray-700">
          <button
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'overview' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            📋 Overview
          </button>
          <button
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'gaps' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('gaps')}
          >
            🔍 Gap Analysis
          </button>
          <button
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'skills' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('skills')}
          >
            ⚙️ Skills
          </button>
          <button
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'chat' 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Ask AI
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Actionable Tip */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">💡 Top Recommendation</h2>
              {topTip ? (
                <TipCard tip={topTip} isPrimary={true} />
              ) : (
                <p className="card p-6 text-gray-700 dark:text-gray-300">Great job! Your resume is well-aligned with the job requirements.</p>
              )}
            </div>

            {/* Summary Stats */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="card p-6 text-center">
                <div className="text-4xl mb-3">✅</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{matchedSkills.length}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Matched Skills</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">{gaps.length}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Skill Gaps</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl mb-3">📚</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{matchedSkills.length + missingSkills.length}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">Total Skills Found</div>
              </div>
            </div>

            {/* Quick Actions */}
            {recommendations.length > 1 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">More Recommendations:</h3>
                <div className="space-y-3">
                  {recommendations.slice(1).map((rec, index) => (
                    <TipCard key={index} tip={typeof rec === 'string' ? rec : rec.text} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gaps' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">🔍 Gap Analysis</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              These are the skills and qualifications mentioned in the job description that are missing from your resume.
            </p>
            <GapList gaps={gaps} />
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">✅ Matched Skills</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Skills you have that match the job requirements
              </p>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.length > 0 ? (
                  matchedSkills.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full font-medium">
                      {typeof skill === 'string' ? skill : skill.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No matched skills found</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">❌ Missing Skills</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Skills required but not found in your resume
              </p>
              <div className="flex flex-wrap gap-2">
                {missingSkills.length > 0 ? (
                  missingSkills.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full font-medium">
                      {typeof skill === 'string' ? skill : skill.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No gaps identified! 🎉</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">💬 Ask Career Questions</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Ask anything about improving your resume, career advice, or skill development.
            </p>
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Suggested questions:</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  What skills should I prioritize learning?
                </span>
                <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  How can I make my resume stronger?
                </span>
                <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  Am I ready for this job?
                </span>
                <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  What certifications would help?
                </span>
              </div>
            </div>
            <ChatBox analysisId={id} analysis={analysis} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Analysis;
