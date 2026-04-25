const stamp = () => new Date().toISOString();

const logger = {
  info: (...args) => console.log(`[${stamp()}] [INFO]`, ...args),
  warn: (...args) => console.warn(`[${stamp()}] [WARN]`, ...args),
  error: (...args) => console.error(`[${stamp()}] [ERROR]`, ...args),
  debug: (...args) => {
    if (String(process.env.LOG_LEVEL || 'info').toLowerCase() === 'debug') {
      console.log(`[${stamp()}] [DEBUG]`, ...args);
    }
  }
};

export default logger;