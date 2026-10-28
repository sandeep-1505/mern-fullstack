// Load local .env file when running outside Docker
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

// 1. Validate required environment variables
const REQUIRED_ENV_VARS = ['MONGO_URI', 'JWT_SECRET', 'PORT', 'API_KEY'];
const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error(
    `[FATAL] Missing required environment variable(s): ${missingVars.join(', ')}`
  );
  console.error(
    '[FATAL] Ensure variables are declared in your .env file or injected via Docker Compose env_file.'
  );
  process.exit(1);
}

// 2. Read configuration from process.env
const PORT = parseInt(process.env.PORT, 10) || 5000;
const MONGO_URI = process.env.MONGO_URI;
// Sensitive secrets: read for application logic, NEVER logged or sent in API responses
const JWT_SECRET = process.env.JWT_SECRET;
const API_KEY = process.env.API_KEY;

// 3. Initialize Express application
const app = express();
app.use(express.json());

// 4. Secure logging helper: Never log actual secrets
console.log('----------------------------------------------------');
console.log('Initializing MERN Application Server...');
console.log(`Port                : ${PORT}`);
console.log(`Environment         : ${process.env.NODE_ENV || 'development'}`);
console.log(`JWT_SECRET Configured: ${JWT_SECRET ? 'Yes (Hidden/Redacted)' : 'No'}`);
console.log(`API_KEY Configured   : ${API_KEY ? 'Yes (Hidden/Redacted)' : 'No'}`);
console.log('----------------------------------------------------');

// 5. Connect to MongoDB using Mongoose
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[DATABASE] Successfully connected to MongoDB.');
  })
  .catch((err) => {
    console.error('[DATABASE ERROR] Failed to connect to MongoDB:', err.message);
  });

// 6. Root endpoint - Requirement: returns 'MERN server is running!'
app.get('/', (req, res) => {
  res.status(200).send('MERN server is running!');
});

// 7. Health check endpoint - returns operational status without exposing secrets
app.get('/health', (req, res) => {
  const readyStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStatus = readyStateMap[mongoose.connection.readyState] || 'unknown';
  const isHealthy = mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2;

  const healthData = {
    status: isHealthy ? 'healthy' : 'degraded',
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
    },
    service: 'mern-env-project',
    timestamp: new Date().toISOString(),
  };

  res.status(isHealthy ? 200 : 503).json(healthData);
});

// 8. Start HTTP Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Listening on http://0.0.0.0:${PORT}`);
  console.log('[SECURITY] Secrets verified and securely protected in memory.');
});

// 9. Graceful shutdown handler
const handleShutdown = (signal) => {
  console.log(`\n[SHUTDOWN] Received ${signal}. Closing server gracefully...`);
  server.close(async () => {
    console.log('[SHUTDOWN] HTTP server closed.');
    try {
      await mongoose.connection.close();
      console.log('[SHUTDOWN] MongoDB connection closed.');
    } catch (e) {
      console.error('[SHUTDOWN ERROR] Error closing MongoDB connection:', e.message);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = app;
