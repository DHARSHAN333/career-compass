import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScoreCard from '../../components/ScoreCard.jsx';
import GapList from '../../components/GapList.jsx';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <button onClick={handleNewAnalysis} className="group mb-6 px-6 py-3 text-lg font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-lg transition-all border border-gray-200 dark:border-gray-700">
          <span className="flex items-center gap-2">
            <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
            New Analysis
          </span>
        </button>
        <div className="flex items-center gap-4 mb-3">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Analysis Results
          </h1>
        </div>
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <span className="text-2xl">📅</span>
          <p className="text-lg font-medium">
            Analyzed on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Match Score - Prominent Display */}
      <div className="max-w-7xl mx-auto mb-10">
        <ScoreCard score={matchScore} matchInfo={matchInfo} />
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-2">
          <button
            className={`flex-1 min-w-[150px] px-6 py-4 font-bold text-lg rounded-xl transition-all ${
              activeTab === 'overview' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-2xl">📋</span>
              <span>Overview</span>
            </span>
          </button>
          <button
            className={`flex-1 min-w-[150px] px-6 py-4 font-bold text-lg rounded-xl transition-all ${
              activeTab === 'gaps' 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('gaps')}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-2xl">🔍</span>
              <span>Gaps</span>
            </span>
          </button>
          <button
            className={`flex-1 min-w-[150px] px-6 py-4 font-bold text-lg rounded-xl transition-all ${
              activeTab === 'skills' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('skills')}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-2xl">⚙️</span>
              <span>Skills</span>
            </span>
          </button>
          <button
            className={`flex-1 min-w-[150px] px-6 py-4 font-bold text-lg rounded-xl transition-all ${
              activeTab === 'chat' 
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg scale-105' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-2xl">💬</span>
              <span>AI Coach</span>
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 text-center border border-green-200 dark:border-green-800 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">✅</div>
                <div className="text-4xl font-black text-green-700 dark:text-green-400 mb-3">{matchedSkills.length}</div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">Matched Skills</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Skills that align with requirements</p>
              </div>
              <div className="group relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 text-center border border-amber-200 dark:border-amber-800 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">⚠️</div>
                <div className="text-4xl font-black text-amber-700 dark:text-amber-400 mb-3">{gaps.length}</div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">Skill Gaps</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Areas for improvement</p>
              </div>
              <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 text-center border border-blue-200 dark:border-blue-800 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">📚</div>
                <div className="text-4xl font-black text-blue-700 dark:text-blue-400 mb-3">{matchedSkills.length + missingSkills.length}</div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">Total Skills</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Comprehensive skill analysis</p>
              </div>
            </div>

            {/* Key Insights */}
            {recommendations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="text-4xl">💡</span>
                  Strategic Recommendations
                </h3>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">{index + 1}</span>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed flex-1 font-medium">{typeof rec === 'string' ? rec : rec.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <span className="text-5xl">🔍</span>
                Skill Gap Analysis
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                These are the skills and qualifications mentioned in the job description that could strengthen your application.
              </p>
            </div>
            <GapList gaps={gaps} />
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-xl border border-green-200 dark:border-green-800 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-5xl">✅</span>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Matched Skills</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    Your skills that align with job requirements
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {matchedSkills.length > 0 ? (
                  matchedSkills.map((skill, index) => (
                    <span key={index} className="group px-5 py-3 bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 rounded-xl font-bold shadow-lg border-2 border-green-300 dark:border-green-700 hover:scale-105 hover:shadow-xl transition-all">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">✓</span>
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 italic">No matched skills found</p>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-5xl">🎯</span>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Skills to Develop</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    Skills that would strengthen your profile
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {missingSkills.length > 0 ? (
                  missingSkills.map((skill, index) => (
                    <span key={index} className="group px-5 py-3 bg-white dark:bg-gray-800 text-red-700 dark:text-red-400 rounded-xl font-bold shadow-lg border-2 border-red-300 dark:border-red-700 hover:scale-105 hover:shadow-xl transition-all">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">+</span>
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    </span>
                  ))
                ) : (
                  <div className="text-center w-full py-6">
                    <p className="text-2xl mb-2">🎉</p>
                    <p className="text-gray-700 dark:text-gray-300 font-bold">Excellent! No skill gaps identified</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <span className="text-5xl">💬</span>
                AI Career Coach
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Get personalized advice on improving your resume, developing skills, and advancing your career.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Suggested Questions:</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:shadow-lg transition-all group">
                    <span className="text-2xl">🎯</span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">What skills should I prioritize?</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:shadow-lg transition-all group">
                    <span className="text-2xl">📊</span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">How can I improve my match score?</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:shadow-lg transition-all group">
                    <span className="text-2xl">🎓</span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">What certifications would help?</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:shadow-lg transition-all group">
                    <span className="text-2xl">✅</span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">Am I ready for this position?</span>
                  </div>
                </div>
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
