function ScoreCard({ score, matchInfo }) {
  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'from-green-500 to-emerald-600', text: 'text-green-600 dark:text-green-400', border: 'border-green-500' };
    if (score >= 60) return { bg: 'from-yellow-500 to-orange-500', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500' };
    return { bg: 'from-red-500 to-pink-600', text: 'text-red-600 dark:text-red-400', border: 'border-red-500' };
  };

  const getMatchDetails = (score) => {
    if (score >= 80) return {
      level: 'Strong Match',
      stars: '⭐⭐⭐⭐⭐',
      rating: `${Math.floor(score / 10)}/10`,
      message: 'Excellent! Your profile strongly aligns with this role.'
    };
    if (score >= 60) return {
      level: 'Good Match',
      stars: '⭐⭐⭐⭐',
      rating: `${Math.floor(score / 10)}/10`,
      message: 'Good fit! Some improvements could strengthen your application.'
    };
    return {
      level: 'Needs Improvement',
      stars: '⭐⭐',
      rating: `${Math.floor(score / 10)}/10`,
      message: 'Consider developing more relevant skills for this position.'
    };
  };

  const details = matchInfo || getMatchDetails(score);
  const colors = getScoreColor(score);

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your Match Score</h2>
        <p className="text-gray-600 dark:text-gray-400">Based on skills and experience analysis</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
        <div className={`relative w-48 h-48 rounded-full border-8 ${colors.border} flex flex-col items-center justify-center bg-gradient-to-br ${colors.bg} text-white shadow-2xl`}>
          <div className="text-6xl font-bold">
            {score}%
          </div>
          <div className="text-sm font-semibold uppercase tracking-wider">Match</div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className={`text-3xl font-bold ${colors.text} mb-3`}>
            {details.level}
          </div>
          <div className="text-2xl mb-3">
            <span className="mr-2">{details.stars}</span>
            <span className="text-gray-600 dark:text-gray-400 text-lg">{details.rating}</span>
          </div>
          <div className="text-gray-700 dark:text-gray-300 text-lg">
            {details.message}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${colors.bg} transition-all duration-1000 flex items-center justify-center`}
            style={{ width: `${score}%` }}
          >
            <span className="text-white font-bold text-sm">{score}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Skills Match</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.min(score + 5, 100)}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${colors.bg} transition-all duration-1000`}
              style={{ width: `${Math.min(score + 5, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Experience Level</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.max(score - 5, 0)}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${colors.bg} transition-all duration-1000`}
              style={{ width: `${Math.max(score - 5, 0)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScoreCard;
