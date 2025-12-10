import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../../services/api.js';

function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await getHistory();
      
      // Handle API response structure { success, data, count }
      const apiAnalyses = response.data || response || [];
      
      // If no data from API, check session storage for recent analysis
      if (apiAnalyses.length === 0) {
        const cached = sessionStorage.getItem('currentAnalysis');
        if (cached) {
          const recentAnalysis = JSON.parse(cached);
          setAnalyses([recentAnalysis]);
        } else {
          setAnalyses([]);
        }
      } else {
        setAnalyses(apiAnalyses);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      // Fallback to session storage
      const cached = sessionStorage.getItem('currentAnalysis');
      if (cached) {
        setAnalyses([JSON.parse(cached)]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-700 dark:text-gray-300">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">📚 Analysis History</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Review your past resume analyses and track your progress
        </p>
      </div>
      
      {analyses.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="text-8xl mb-6">📭</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">No Analysis History</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">You haven't performed any resume analyses yet.</p>
          <button 
            className="btn-primary text-lg"
            onClick={() => navigate('/')}
          >
            Start Your First Analysis
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((analysis, index) => {
            const analysisId = analysis.analysisId || analysis._id || `analysis-${index}`;
            const matchScore = analysis.matchScore || analysis.score || 0;
            const createdAt = analysis.createdAt || new Date().toISOString();
            
            return (
              <div 
                key={analysisId} 
                className="card p-6 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate(`/analysis/${analysisId}`)}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <span className="text-2xl font-bold">{matchScore}</span>
                    <span className="text-xs">Match</span>
                  </div>
                  <div className="flex-1 ml-4">
                    <div className={`text-sm font-semibold mb-1 ${
                      matchScore >= 80 ? 'text-green-600 dark:text-green-400' : 
                      matchScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {matchScore >= 80 ? '🟢 Strong Match' : 
                       matchScore >= 60 ? '🟡 Good Match' : 
                       '🔴 Needs Work'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl mb-1">✅</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {analysis.skills?.matched?.length || analysis.matchedSkills?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Matched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">⚠️</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {analysis.gaps?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Gaps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">💡</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {analysis.recommendations?.length || analysis.tips?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Tips</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
