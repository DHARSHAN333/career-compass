import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../../services/api.js';
import styles from './History.module.css';

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
      <div className={styles.history}>
        <div className={styles.loader}>Loading history...</div>
      </div>
    );
  }

  return (
    <div className={styles.history}>
      <div className={styles.header}>
        <h1>📚 Analysis History</h1>
        <p className={styles.subtitle}>
          Review your past resume analyses and track your progress
        </p>
      </div>
      
      {analyses.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h2>No Analysis History</h2>
          <p>You haven't performed any resume analyses yet.</p>
          <button 
            className={styles.startButton}
            onClick={() => navigate('/')}
          >
            Start Your First Analysis
          </button>
        </div>
      ) : (
        <div className={styles.historyGrid}>
          {analyses.map((analysis, index) => {
            const analysisId = analysis.analysisId || analysis._id || `analysis-${index}`;
            const matchScore = analysis.matchScore || analysis.score || 0;
            const createdAt = analysis.createdAt || new Date().toISOString();
            
            return (
              <div 
                key={analysisId} 
                className={styles.historyCard}
                onClick={() => navigate(`/analysis/${analysisId}`)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.scoreCircle}>
                    <span className={styles.scoreValue}>{matchScore}</span>
                    <span className={styles.scoreLabel}>Match</span>
                  </div>
                  <div className={styles.cardInfo}>
                    <div className={styles.matchLevel}>
                      {matchScore >= 80 ? '🟢 Strong Match' : 
                       matchScore >= 60 ? '🟡 Good Match' : 
                       '🔴 Needs Work'}
                    </div>
                    <div className={styles.date}>
                      {new Date(createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className={styles.cardStats}>
                  <div className={styles.stat}>
                    <span className={styles.statIcon}>✅</span>
                    <span className={styles.statValue}>
                      {analysis.skills?.matched?.length || analysis.matchedSkills?.length || 0}
                    </span>
                    <span className={styles.statLabel}>Matched</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statIcon}>⚠️</span>
                    <span className={styles.statValue}>
                      {analysis.gaps?.length || 0}
                    </span>
                    <span className={styles.statLabel}>Gaps</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statIcon}>💡</span>
                    <span className={styles.statValue}>
                      {analysis.recommendations?.length || analysis.tips?.length || 0}
                    </span>
                    <span className={styles.statLabel}>Tips</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.viewLink}>View Details →</span>
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
