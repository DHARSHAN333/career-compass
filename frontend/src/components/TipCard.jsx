import './TipCard.css';

function TipCard({ tip, isPrimary = false }) {
  return (
    <div className={`tip-card ${isPrimary ? 'tip-card-primary' : ''}`}>
      <div className="tip-icon">💡</div>
      <div className="tip-content">
        <p className="tip-text">{tip}</p>
      </div>
      {isPrimary && (
        <div className="tip-badge">Top Priority</div>
      )}
    </div>
  );
}

export default TipCard;
