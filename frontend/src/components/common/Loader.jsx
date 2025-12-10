function Loader({ size = 'medium', text = 'Loading...' }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin`}></div>
      <p className="text-gray-700 dark:text-gray-300 font-medium">{text}</p>
    </div>
  );
}

export default Loader;
