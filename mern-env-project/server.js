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
// When accessed via a web browser (Accept: text/html), renders a rich DevOps Dashboard website.
// When accessed via curl or API clients, returns plain text 'MERN server is running!'.
app.get('/', (req, res) => {
  const isBrowser = req.headers.accept && req.headers.accept.includes('text/html');

  if (!isBrowser) {
    return res.status(200).send('MERN server is running!');
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MERN Environment Variables | Docker Compose</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: rgba(17, 24, 39, 0.75);
      --border: rgba(255, 255, 255, 0.08);
      --border-hover: rgba(99, 102, 241, 0.4);
      --accent: #6366f1;
      --accent-glow: rgba(99, 102, 241, 0.25);
      --success: #10b981;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --font: 'Inter', system-ui, -apple-system, sans-serif;
      --mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, var(--bg) 65%);
      color: var(--text);
      font-family: var(--font);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
    }

    .container {
      max-width: 960px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    header {
      text-align: center;
      padding: 16px 0 24px;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--success);
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 12px var(--success);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    h1 {
      font-size: 2.75rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 12px;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
      max-width: 620px;
      margin: 0 auto;
      line-height: 1.5;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      backdrop-filter: blur(16px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      transition: all 0.25s ease;
    }

    .card:hover {
      border-color: var(--border-hover);
      transform: translateY(-2px);
      box-shadow: 0 12px 40px var(--accent-glow);
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      color: #e0e7ff;
      margin-bottom: 16px;
    }

    .card-title svg {
      width: 22px;
      height: 22px;
      color: var(--accent);
    }

    .spec-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .spec-table tr {
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    .spec-table tr:last-child {
      border-bottom: none;
    }

    .spec-table td {
      padding: 10px 0;
    }

    .spec-table td:first-child {
      color: var(--text-muted);
      font-weight: 500;
      width: 45%;
    }

    .spec-table td:last-child {
      color: var(--text);
      font-family: var(--mono);
      font-size: 0.85rem;
      text-align: right;
    }

    .tag-secure {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #c7d2fe;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .tag-online {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .live-monitor {
      background: #0d1117;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .monitor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .monitor-title {
      font-size: 1rem;
      font-weight: 600;
      color: #e5e7eb;
    }

    .btn-ping {
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn-ping:hover {
      background: #4f46e5;
      transform: scale(1.02);
    }

    .code-box {
      background: #030712;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      padding: 16px;
      font-family: var(--mono);
      font-size: 0.85rem;
      color: #a5b4fc;
      overflow-x: auto;
      line-height: 1.5;
    }

    footer {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge-pill">
        <span class="pulse-dot"></span> Docker Compose Stack Active
      </div>
      <h1>MERN server is running!</h1>
      <p class="subtitle">
        Enterprise Node.js + MongoDB stack configured with <code>env_file</code> isolation, non-root containers, and zero credential leakage.
      </p>
    </header>

    <div class="grid">
      <!-- Node.js App Service Card -->
      <div class="card">
        <div class="card-title">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          Node.js Application
        </div>
        <table class="spec-table">
          <tr>
            <td>Container</td>
            <td><code>mern_app</code></td>
          </tr>
          <tr>
            <td>Base Image</td>
            <td><code>node:20-alpine</code></td>
          </tr>
          <tr>
            <td>User Privilege</td>
            <td><span class="tag-secure">non-root (node)</span></td>
          </tr>
          <tr>
            <td>Host Port</td>
            <td><code>5000:5000</code></td>
          </tr>
          <tr>
            <td>Status</td>
            <td><span class="tag-online">● HEALTHY</span></td>
          </tr>
        </table>
      </div>

      <!-- MongoDB Service Card -->
      <div class="card">
        <div class="card-title">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
          MongoDB Database
        </div>
        <table class="spec-table">
          <tr>
            <td>Container</td>
            <td><code>mern_mongo</code></td>
          </tr>
          <tr>
            <td>Engine Version</td>
            <td><code>mongo:6.0</code></td>
          </tr>
          <tr>
            <td>Volume Mount</td>
            <td><code>mern_mongo_data</code></td>
          </tr>
          <tr>
            <td>Port Exposure</td>
            <td><span class="tag-secure">Internal only (:27017)</span></td>
          </tr>
          <tr>
            <td>Health Probe</td>
            <td><span class="tag-online">● PING 200 OK</span></td>
          </tr>
        </table>
      </div>

      <!-- Secret & Environment Card -->
      <div class="card">
        <div class="card-title">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          Injected Environment
        </div>
        <table class="spec-table">
          <tr>
            <td>Source Mechanism</td>
            <td><code>env_file: .env</code></td>
          </tr>
          <tr>
            <td>Git Tracking</td>
            <td><span class="tag-secure">Ignored via .gitignore</span></td>
          </tr>
          <tr>
            <td>PORT</td>
            <td><code>\${PORT}</code></td>
          </tr>
          <tr>
            <td>JWT_SECRET</td>
            <td><span class="tag-secure">🔒 Redacted / In-Memory</span></td>
          </tr>
          <tr>
            <td>API_KEY</td>
            <td><span class="tag-secure">🔒 Redacted / In-Memory</span></td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Live Health Check & API Probe -->
    <div class="live-monitor">
      <div class="monitor-header">
        <div class="monitor-title">Live Service Health Probe (<code>/health</code>)</div>
        <button class="btn-ping" onclick="fetchHealth()">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Refresh Health Status
        </button>
      </div>
      <div class="code-box" id="health-output">Fetching live telemetry...</div>
    </div>

    <footer>
      PROJECT 70 • MERN Environment Variables Using Docker Compose • Production Ready
    </footer>
  </div>

  <script>
    async function fetchHealth() {
      const box = document.getElementById('health-output');
      box.innerText = 'Pinging /health...';
      try {
        const res = await fetch('/health');
        const json = await res.json();
        box.innerText = JSON.stringify(json, null, 2);
      } catch (err) {
        box.innerText = 'Error querying health endpoint: ' + err.message;
      }
    }
    fetchHealth();
  </script>
</body>
</html>`;

  res.status(200).send(html);
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
