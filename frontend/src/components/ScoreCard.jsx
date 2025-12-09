import './ScoreCard.css';

function ScoreCard({ score, matchInfo }) {
  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  const getMatchDetails = (score) => {
    if (score >= 80) return {
      level: 'Strong Match',
      stars: '⭐⭐⭐⭐⭐',
      rating: `${Math.floor(score / 10)}/10`,
      message: 'Excellent! Your profile strongly aligns with this role.',
      color: '#28a745'
    };
    if (score >= 60) return {
      level: 'Good Match',
      stars: '⭐⭐⭐⭐',
      rating: `${Math.floor(score / 10)}/10`,
      message: 'Good fit! Some improvements could strengthen your application.',
      color: '#ffc107'
    };
    return {
      level: 'Needs Improvement',
      stars: '⭐⭐',
      rating: `${Math.floor(score / 10)}/10`,
      message: 'Consider developing more relevant skills for this position.',
      color: '#dc3545'
    };
  };

  const details = matchInfo || getMatchDetails(score);
  const color = details.color || getScoreColor(score);

  // Calculate progress bar percentage
  const progressPercentage = score;

  return (
    <div className="score-card">
      <div className="score-header">
        <h2>Your Match Score</h2>
        <p className="score-subtitle">Based on skills and experience analysis</p>
      </div>

      <div className="score-main">
        <div className="score-circle" style={{ borderColor: color }}>
          <div className="score-value" style={{ color: color }}>
            {score}%
          </div>
          <div className="score-label">Match</div>
        </div>

        <div className="score-details">
          <div className="match-level" style={{ color: color }}>
            {details.level}
          </div>
          <div className="match-rating">
            <span className="stars">{details.stars}</span>
            <span className="rating-text">{details.rating}</span>
          </div>
          <div className="match-message">
            {details.message}
          </div>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${progressPercentage}%`,
              backgroundColor: color 
            }}
          >
            <span className="progress-label">{score}%</span>
          </div>
        </div>
      </div>

      <div className="score-breakdown">
        <div className="breakdown-item">
          <span className="breakdown-label">Skills Match</span>
          <span className="breakdown-bar">
            <span 
              className="breakdown-fill" 
              style={{ 
                width: `${Math.min(score + 5, 100)}%`,
                backgroundColor: color 
              }}
            />
          </span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">Experience Level</span>
          <span className="breakdown-bar">
            <span 
              className="breakdown-fill" 
              style={{ 
                width: `${Math.max(score - 5, 0)}%`,
                backgroundColor: color 
              }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

export default ScoreCard;
