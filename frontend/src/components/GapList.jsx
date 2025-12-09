import './GapList.css';

function GapList({ gaps }) {
  if (!gaps || gaps.length === 0) {
    return (
      <div className="no-gaps">
        <div className="no-gaps-icon">🎉</div>
        <h3>No Gaps Identified!</h3>
        <p>Your resume covers all the key requirements mentioned in the job description.</p>
      </div>
    );
  }

  // Helper to get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="gap-list-container">
      <div className="gap-summary">
        <span className="gap-count">{gaps.length}</span>
        <span className="gap-count-label">
          {gaps.length === 1 ? 'Skill Gap Found' : 'Skill Gaps Found'}
        </span>
      </div>

      <ul className="gap-list">
        {gaps.map((gap, index) => {
          // Handle both string and object formats
          const isObject = typeof gap === 'object' && gap !== null;
          const title = isObject ? gap.description : gap;
          const category = isObject ? gap.category : null;
          const priority = isObject ? gap.priority : (index < 3 ? 'High' : 'Medium');
          const actionable = isObject ? gap.actionable : 'Consider adding this to your resume or learning it';

          return (
            <li key={index} className="gap-item">
              <div className="gap-icon">⚠️</div>
              <div className="gap-content">
                {category && <div className="gap-category">{category}</div>}
                <div className="gap-title">{title}</div>
                <div className="gap-suggestion">
                  💡 {actionable}
                </div>
              </div>
              <div className="gap-priority">
                {getPriorityIcon(priority)} {priority}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="gap-footer">
        <p>💡 <strong>Pro Tip:</strong> Focus on the high-priority gaps first to maximize your impact.</p>
      </div>
    </div>
  );
}

export default GapList;
