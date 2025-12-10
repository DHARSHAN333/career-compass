function TipCard({ tip, isPrimary = false }) {
  return (
    <div className={`card p-6 flex items-start gap-4 ${
      isPrimary 
        ? 'border-2 border-blue-500 dark:border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20' 
        : ''
    }`}>
      <div className="text-3xl flex-shrink-0">💡</div>
      <div className="flex-1">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{tip}</p>
      </div>
      {isPrimary && (
        <span className="badge badge-primary flex-shrink-0">Top Priority</span>
      )}
    </div>
  );
}

export default TipCard;
