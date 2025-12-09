import app from './src/app.js';
import config from './src/config/index.js';
import logger from './src/utils/logger.js';

const PORT = config.port || 5000;

app.listen(PORT, () => {
  logger.info(`Backend server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});
