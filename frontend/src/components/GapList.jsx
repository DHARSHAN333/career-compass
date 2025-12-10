function GapList({ gaps }) {
  if (!gaps || gaps.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No Gaps Identified!</h3>
        <p className="text-gray-600 dark:text-gray-400">Your resume covers all the key requirements mentioned in the job description.</p>
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

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="text-5xl font-bold text-yellow-600 dark:text-yellow-400">{gaps.length}</div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {gaps.length === 1 ? 'Skill Gap Found' : 'Skill Gaps Found'}
        </div>
      </div>

      <ul className="space-y-4 mb-6">
        {gaps.map((gap, index) => {
          // Handle both string and object formats
          const isObject = typeof gap === 'object' && gap !== null;
          const title = isObject ? gap.description : gap;
          const category = isObject ? gap.category : null;
          const priority = isObject ? gap.priority : (index < 3 ? 'High' : 'Medium');
          const actionable = isObject ? gap.actionable : 'Consider adding this to your resume or learning it';

          return (
            <li key={index} className="card p-6 flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">⚠️</div>
              <div className="flex-1">
                {category && (
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                    {category}
                  </div>
                )}
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span>💡</span>
                  <span>{actionable}</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 flex-shrink-0 ${getPriorityColor(priority)}`}>
                <span>{getPriorityIcon(priority)}</span>
                <span>{priority}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
        <span className="font-bold">💡 Pro Tip:</span> Focus on the high-priority gaps first to maximize your impact.
      </div>
    </div>
  );
}

export default GapList;
