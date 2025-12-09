import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScoreCard from '../../components/ScoreCard.jsx';
import GapList from '../../components/GapList.jsx';
import TipCard from '../../components/TipCard.jsx';
import ChatBox from '../../components/ChatBox.jsx';
import Loader from '../../components/common/Loader.jsx';
import { getAnalysis } from '../../services/api.js';
import styles from './Analysis.module.css';

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
      <div className={styles.loadingContainer}>
        <Loader text="Loading your analysis..." />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={styles.error}>
        <h2>❌ Analysis not found</h2>
        <p>The requested analysis could not be found or has expired.</p>
        <button onClick={handleNewAnalysis} className={styles.backButton}>
          ← Start New Analysis
        </button>
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
    <div className={styles.analysis}>
      {/* Header */}
      <div className={styles.analysisHeader}>
        <button onClick={handleNewAnalysis} className={styles.backButton}>
          ← New Analysis
        </button>
        <h1>📊 Resume Analysis Results</h1>
        <p className={styles.timestamp}>
          Analyzed on {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Match Score - Prominent Display */}
      <div className={styles.scoreSection}>
        <ScoreCard score={matchScore} matchInfo={matchInfo} />
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📋 Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'gaps' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('gaps')}
        >
          🔍 Gap Analysis
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'skills' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          ⚙️ Skills
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'chat' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Ask AI
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <div className={styles.overviewTab}>
            {/* Actionable Tip */}
            <div className={styles.tipSection}>
              <h2>💡 Top Recommendation</h2>
              {topTip ? (
                <TipCard tip={topTip} isPrimary={true} />
              ) : (
                <p className={styles.noTips}>Great job! Your resume is well-aligned with the job requirements.</p>
              )}
            </div>

            {/* Summary Stats */}
            <div className={styles.summaryGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statValue}>{matchedSkills.length}</div>
                <div className={styles.statLabel}>Matched Skills</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>⚠️</div>
                <div className={styles.statValue}>{gaps.length}</div>
                <div className={styles.statLabel}>Skill Gaps</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📚</div>
                <div className={styles.statValue}>{matchedSkills.length + missingSkills.length}</div>
                <div className={styles.statLabel}>Total Skills Found</div>
              </div>
            </div>

            {/* Quick Actions */}
            {recommendations.length > 1 && (
              <div className={styles.moreRecommendations}>
                <h3>More Recommendations:</h3>
                {recommendations.slice(1).map((rec, index) => (
                  <TipCard key={index} tip={typeof rec === 'string' ? rec : rec.text} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className={styles.gapsTab}>
            <h2>🔍 Gap Analysis</h2>
            <p className={styles.sectionDescription}>
              These are the skills and qualifications mentioned in the job description that are missing from your resume.
            </p>
            <GapList gaps={gaps} />
          </div>
        )}

        {activeTab === 'skills' && (
          <div className={styles.skillsTab}>
            <div className={styles.skillsContainer}>
              <div className={styles.skillColumn}>
                <h3>✅ Matched Skills</h3>
                <p className={styles.skillColumnDesc}>
                  Skills you have that match the job requirements
                </p>
                <div className={styles.skillList}>
                  {matchedSkills.length > 0 ? (
                    matchedSkills.map((skill, index) => (
                      <div key={index} className={`${styles.skillBadge} ${styles.matched}`}>
                        {typeof skill === 'string' ? skill : skill.name}
                      </div>
                    ))
                  ) : (
                    <p className={styles.noSkills}>No matched skills found</p>
                  )}
                </div>
              </div>

              <div className={styles.skillColumn}>
                <h3>❌ Missing Skills</h3>
                <p className={styles.skillColumnDesc}>
                  Skills required but not found in your resume
                </p>
                <div className={styles.skillList}>
                  {missingSkills.length > 0 ? (
                    missingSkills.map((skill, index) => (
                      <div key={index} className={`${styles.skillBadge} ${styles.missing}`}>
                        {typeof skill === 'string' ? skill : skill.name}
                      </div>
                    ))
                  ) : (
                    <p className={styles.noSkills}>No gaps identified! 🎉</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className={styles.chatTab}>
            <h2>💬 Ask Career Questions</h2>
            <p className={styles.sectionDescription}>
              Ask anything about improving your resume, career advice, or skill development.
            </p>
            <div className={styles.suggestedQuestions}>
              <h4>Suggested questions:</h4>
              <div className={styles.questionChips}>
                <span className={styles.chip}>What skills should I prioritize learning?</span>
                <span className={styles.chip}>How can I make my resume stronger?</span>
                <span className={styles.chip}>Am I ready for this job?</span>
                <span className={styles.chip}>What certifications would help?</span>
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
