import app from './src/app.js';
import config from './src/config/index.js';
import logger from './src/utils/logger.js';

const port = config.port || 8000;

const server = app.listen(port, '0.0.0.0', () => {
  logger.info(`Career Compass AI service running on port ${port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

server.on('error', (error) => {
  logger.error('AI service failed to start:', error.message);
});

// Keep the process alive even when started from detached PowerShell jobs on Windows.
setInterval(() => {}, 60_000);