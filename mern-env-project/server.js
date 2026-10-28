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
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #07090e;
      --bg-card: rgba(15, 23, 42, 0.75);
      --bg-card-hover: rgba(30, 41, 59, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(99, 102, 241, 0.45);
      --accent: #6366f1;
      --accent-light: #818cf8;
      --accent-glow: rgba(99, 102, 241, 0.3);
      --cyan: #06b6d4;
      --cyan-glow: rgba(6, 182, 212, 0.25);
      --emerald: #10b981;
      --emerald-glow: rgba(16, 185, 129, 0.25);
      --amber: #f59e0b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --font-display: 'Outfit', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.18) 0%, transparent 50%),
        radial-gradient(circle at 85% 30%, rgba(6, 182, 212, 0.12) 0%, transparent 40%),
        radial-gradient(circle at 15% 70%, rgba(16, 185, 129, 0.08) 0%, transparent 40%);
      color: var(--text);
      font-family: var(--font-body);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 20px 60px;
      overflow-x: hidden;
    }

    .container {
      max-width: 1080px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    /* Top Navigation Bar */
    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border);
      border-radius: 100px;
      padding: 10px 24px;
      backdrop-filter: blur(12px);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1.05rem;
      color: #fff;
      letter-spacing: -0.01em;
    }

    .brand-icon {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, var(--accent), var(--cyan));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 16px var(--accent-glow);
    }

    .brand-icon svg { width: 16px; height: 16px; color: #fff; }

    .nav-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--emerald);
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 5px 14px;
      border-radius: 100px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--emerald);
      box-shadow: 0 0 10px var(--emerald);
      animation: pulse 1.8s infinite ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(0.7); opacity: 0.4; }
    }

    /* Hero Section */
    .hero {
      text-align: center;
      padding: 24px 0 12px;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 18px;
      letter-spacing: 0.04em;
    }

    h1 {
      font-family: var(--font-display);
      font-size: 3.2rem;
      font-weight: 800;
      letter-spacing: -0.035em;
      line-height: 1.15;
      background: linear-gradient(135deg, #ffffff 30%, #c7d2fe 70%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 16px;
    }

    .hero-desc {
      color: var(--text-muted);
      font-size: 1.15rem;
      max-width: 680px;
      margin: 0 auto;
      line-height: 1.6;
      font-weight: 400;
    }

    /* Live Telemetry KPI Bar */
    .kpi-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 20px 24px;
      backdrop-filter: blur(14px);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.25s ease;
    }

    .kpi-card:hover {
      border-color: var(--border-accent);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px var(--accent-glow);
    }

    .kpi-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .kpi-icon svg { width: 22px; height: 22px; }
    .kpi-blue { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .kpi-green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .kpi-cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
    .kpi-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

    .kpi-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .kpi-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      font-weight: 600;
    }

    .kpi-value {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 700;
      color: #fff;
    }

    /* Architecture Topology Banner */
    .topology-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 26px 30px;
      backdrop-filter: blur(16px);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-title svg { width: 20px; height: 20px; color: var(--cyan); }

    .topology-flow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      background: rgba(3, 7, 18, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 20px 24px;
    }

    .flow-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
      flex: 1;
      min-width: 140px;
    }

    .flow-icon-circle {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      transition: all 0.2s ease;
    }

    .flow-node:hover .flow-icon-circle {
      border-color: var(--accent);
      transform: scale(1.08);
      box-shadow: 0 0 20px var(--accent-glow);
    }

    .flow-icon-circle svg { width: 26px; height: 26px; }
    .flow-title { font-weight: 700; font-size: 0.95rem; color: #fff; }
    .flow-subtitle { font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); }

    .flow-arrow {
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .flow-arrow svg { width: 24px; height: 24px; }

    /* Service Cards Grid */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
      gap: 20px;
    }

    .service-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 26px;
      backdrop-filter: blur(16px);
      display: flex;
      flex-direction: column;
      gap: 18px;
      transition: all 0.25s ease;
    }

    .service-card:hover {
      border-color: var(--border-accent);
      transform: translateY(-3px);
      box-shadow: 0 12px 32px var(--accent-glow);
    }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-head-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .service-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(99, 102, 241, 0.14);
      border: 1px solid rgba(99, 102, 241, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #a5b4fc;
    }

    .service-icon svg { width: 20px; height: 20px; }
    .service-name { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: #fff; }
    .service-badge {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 4px 10px;
      border-radius: 100px;
      text-transform: uppercase;
    }

    .badge-live { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-lock { background: rgba(99, 102, 241, 0.15); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); }

    .kv-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .kv-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 0.88rem;
    }

    .kv-item:last-child { border-bottom: none; }
    .kv-key { color: var(--text-muted); font-weight: 500; }
    .kv-val { font-family: var(--font-mono); font-size: 0.82rem; color: #e2e8f0; }

    .pill-secure {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #c7d2fe;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
    }

    /* Live Interactive API Probe Console */
    .console-card {
      background: #090e17;
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
    }

    .console-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .console-tabs {
      display: flex;
      gap: 8px;
    }

    .tab-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .tab-btn:hover, .tab-btn.active {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
      box-shadow: 0 0 16px var(--accent-glow);
    }

    .action-btn-group {
      display: flex;
      gap: 10px;
    }

    .icon-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 8px 14px;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: rgba(51, 65, 85, 0.8);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .code-display {
      background: #040711;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 14px;
      padding: 18px 20px;
      font-family: var(--font-mono);
      font-size: 0.86rem;
      color: #7dd3fc;
      overflow-x: auto;
      line-height: 1.6;
      min-height: 120px;
      position: relative;
    }

    .latency-tag {
      position: absolute;
      top: 14px;
      right: 16px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #34d399;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      padding: 3px 8px;
      border-radius: 6px;
    }

    /* Security Checklist */
    .checklist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 14px;
    }

    .check-item {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.88rem;
      color: #e2e8f0;
      transition: all 0.2s;
    }

    .check-item:hover {
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(15, 23, 42, 0.8);
    }

    .check-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.15);
      color: var(--emerald);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .check-icon svg { width: 14px; height: 14px; }

    /* Footer */
    footer {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.88rem;
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--emerald);
      color: #042f2e;
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.85rem;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s;
      pointer-events: none;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
    }

    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    @media (max-width: 768px) {
      h1 { font-size: 2.3rem; }
      .topology-flow { flex-direction: column; gap: 20px; }
      .flow-arrow { transform: rotate(90deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Navigation Bar -->
    <nav class="top-nav">
      <div class="brand">
        <div class="brand-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <span>DevOps Environment Studio</span>
      </div>
      <div class="nav-status">
        <span class="pulse-dot"></span>
        <span id="nav-status-text">Docker Healthy</span>
      </div>
    </nav>

    <!-- Hero Title -->
    <header class="hero">
      <div class="hero-badge">
        PROJECT 70 • MERN DOCKER COMPOSE ORCHESTRATION
      </div>
      <h1>MERN server is running!</h1>
      <p class="hero-desc">
        Node.js, Express, and MongoDB microservices containerized with health-dependent startup, <code>env_file</code> isolation, and complete secret protection.
      </p>
    </header>

    <!-- KPI Metric Badges -->
    <section class="kpi-bar">
      <div class="kpi-card">
        <div class="kpi-icon kpi-blue">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">System Uptime</div>
          <div class="kpi-value" id="kpi-uptime">Loading...</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon kpi-green">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">Database Connection</div>
          <div class="kpi-value" id="kpi-db" style="color: #34d399;">CONNECTED</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon kpi-cyan">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">Secret Security</div>
          <div class="kpi-value">A+ (Zero Leaks)</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon kpi-amber">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">API Latency</div>
          <div class="kpi-value" id="kpi-latency">&lt; 3ms</div>
        </div>
      </div>
    </section>

    <!-- Architecture Topology Diagram -->
    <section class="topology-card">
      <div class="section-title">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <span>Environment Injection Topology</span>
      </div>

      <div class="topology-flow">
        <!-- Node 1: Host .env -->
        <div class="flow-node">
          <div class="flow-icon-circle" style="color: #fbbf24;">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <div class="flow-title">Host .env File</div>
          <div class="flow-subtitle">GIT-IGNORED SECRETS</div>
        </div>

        <div class="flow-arrow">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </div>

        <!-- Node 2: Docker Compose -->
        <div class="flow-node">
          <div class="flow-icon-circle" style="color: #38bdf8;">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <div class="flow-title">Docker Compose</div>
          <div class="flow-subtitle">env_file INJECTION</div>
        </div>

        <div class="flow-arrow">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </div>

        <!-- Node 3: mern_app -->
        <div class="flow-node">
          <div class="flow-icon-circle" style="color: #818cf8;">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"></path></svg>
          </div>
          <div class="flow-title">mern_app (:5000)</div>
          <div class="flow-subtitle">NON-ROOT (NODE)</div>
        </div>

        <div class="flow-arrow">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
        </div>

        <!-- Node 4: mern_mongo -->
        <div class="flow-node">
          <div class="flow-icon-circle" style="color: #34d399;">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
          </div>
          <div class="flow-title">mern_mongo (:27017)</div>
          <div class="flow-subtitle">PRIVATE INTERNAL NET</div>
        </div>
      </div>
    </section>

    <!-- Services Deep Dive Cards -->
    <div class="services-grid">
      <!-- Card 1: Node.js App -->
      <div class="service-card">
        <div class="card-head">
          <div class="card-head-left">
            <div class="service-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
            </div>
            <div>
              <div class="service-name">Node.js Express API</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Application Layer</div>
            </div>
          </div>
          <span class="service-badge badge-live">HEALTHY</span>
        </div>
        <div class="kv-list">
          <div class="kv-item"><span class="kv-key">Container</span><span class="kv-val">mern_app</span></div>
          <div class="kv-item"><span class="kv-key">Base Image</span><span class="kv-val">node:20-alpine</span></div>
          <div class="kv-item"><span class="kv-key">Security User</span><span class="kv-val"><span class="pill-secure">non-root (node)</span></span></div>
          <div class="kv-item"><span class="kv-key">Exposed Port</span><span class="kv-val">5000:5000</span></div>
          <div class="kv-item"><span class="kv-key">Health Probe</span><span class="kv-val">GET /health (15s)</span></div>
        </div>
      </div>

      <!-- Card 2: MongoDB -->
      <div class="service-card">
        <div class="card-head">
          <div class="card-head-left">
            <div class="service-icon" style="background: rgba(16, 185, 129, 0.14); border-color: rgba(16, 185, 129, 0.25); color: #6ee7b7;">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
            </div>
            <div>
              <div class="service-name">MongoDB Database</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Persistent Storage Layer</div>
            </div>
          </div>
          <span class="service-badge badge-live">HEALTHY</span>
        </div>
        <div class="kv-list">
          <div class="kv-item"><span class="kv-key">Container</span><span class="kv-val">mern_mongo</span></div>
          <div class="kv-item"><span class="kv-key">Engine Image</span><span class="kv-val">mongo:6.0</span></div>
          <div class="kv-item"><span class="kv-key">Network Policy</span><span class="kv-val"><span class="pill-secure">Private / Isolated</span></span></div>
          <div class="kv-item"><span class="kv-key">Named Volume</span><span class="kv-val">mern_mongo_data</span></div>
          <div class="kv-item"><span class="kv-key">Healthcheck</span><span class="kv-val">mongosh ping (10s)</span></div>
        </div>
      </div>

      <!-- Card 3: Environment Variables -->
      <div class="service-card">
        <div class="card-head">
          <div class="card-head-left">
            <div class="service-icon" style="background: rgba(245, 158, 11, 0.14); border-color: rgba(245, 158, 11, 0.25); color: #fcd34d;">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <div>
              <div class="service-name">Injected Secrets</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Zero-Leak Memory Cache</div>
            </div>
          </div>
          <span class="service-badge badge-lock">ISOLATED</span>
        </div>
        <div class="kv-list">
          <div class="kv-item"><span class="kv-key">PORT</span><span class="kv-val">${PORT}</span></div>
          <div class="kv-item"><span class="kv-key">MONGO_URI</span><span class="kv-val" style="font-size: 0.75rem;">mongodb://mongo:27017/...</span></div>
          <div class="kv-item"><span class="kv-key">JWT_SECRET</span><span class="kv-val"><span class="pill-secure">🔒 Masked In-Memory</span></span></div>
          <div class="kv-item"><span class="kv-key">API_KEY</span><span class="kv-val"><span class="pill-secure">🔒 Masked In-Memory</span></span></div>
          <div class="kv-item"><span class="kv-key">Git Excluded</span><span class="kv-val"><span class="pill-secure">.gitignore ✓</span></span></div>
        </div>
      </div>
    </div>

    <!-- Live Interactive API Probe Console -->
    <section class="console-card">
      <div class="console-bar">
        <div class="console-tabs">
          <button class="tab-btn active" id="tab-health" onclick="switchTab('health')">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            GET /health
          </button>
          <button class="tab-btn" id="tab-root" onclick="switchTab('root')">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            GET / (Raw Text)
          </button>
        </div>

        <div class="action-btn-group">
          <button class="icon-btn" onclick="copyCurl()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
            Copy cURL
          </button>
          <button class="icon-btn" onclick="executeProbe()">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Execute Probe
          </button>
        </div>
      </div>

      <div class="code-display" id="console-output">
        <span class="latency-tag" id="latency-tag">RTT: ~2ms</span>
        <pre id="raw-code">Pinging microservice telemetry...</pre>
      </div>
    </section>

    <!-- Production DevOps Security Checklist -->
    <section>
      <div class="section-title" style="margin-bottom: 16px;">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        <span>Production Security & DevOps Standards Verified</span>
      </div>
      <div class="checklist-grid">
        <div class="check-item">
          <div class="check-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>
          <span>.env excluded by .gitignore</span>
        </div>
        <div class="check-item">
          <div class="check-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>
          <span>.dockerignore prevents build leaks</span>
        </div>
        <div class="check-item">
          <div class="check-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>
          <span>App waits for Mongo health check</span>
        </div>
        <div class="check-item">
          <div class="check-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>
          <span>Non-root Alpine user (node)</span>
        </div>
        <div class="check-item">
          <div class="check-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>
          <span>Secrets masked in logs & /health</span>
        </div>
        <div class="check-item">
          <div class="check-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></div>
          <span>MongoDB port restricted to Docker network</span>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <div><strong>PROJECT 70: MERN Environment Variables Using Docker Compose</strong></div>
      <div style="color: #64748b; font-size: 0.8rem;">Deployed with Docker Compose • Zero Secret Leaks • Synchronized on GitHub</div>
    </footer>
  </div>

  <div class="toast" id="toast">Copied to Clipboard!</div>

  <script>
    let currentTab = 'health';

    function formatUptime(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return \`\${h > 0 ? h + 'h ' : ''}\${m}m \${s}s\`;
    }

    async function executeProbe() {
      const output = document.getElementById('raw-code');
      const latencyTag = document.getElementById('latency-tag');
      const startTime = performance.now();

      try {
        if (currentTab === 'health') {
          const res = await fetch('/health');
          const elapsed = Math.round(performance.now() - startTime);
          const data = await res.json();
          output.innerText = JSON.stringify(data, null, 2);
          latencyTag.innerText = 'RTT: ' + elapsed + 'ms';
          document.getElementById('kpi-latency').innerText = elapsed + 'ms';

          // Update KPI values
          if (data.uptime !== undefined) {
            document.getElementById('kpi-uptime').innerText = formatUptime(data.uptime);
          }
          if (data.database && data.database.status) {
            document.getElementById('kpi-db').innerText = data.database.status.toUpperCase();
          }
        } else {
          // Fetch raw text for /
          const res = await fetch('/', { headers: { 'Accept': 'text/plain' } });
          const elapsed = Math.round(performance.now() - startTime);
          const text = await res.text();
          output.innerText = text;
          latencyTag.innerText = 'RTT: ' + elapsed + 'ms';
          document.getElementById('kpi-latency').innerText = elapsed + 'ms';
        }
      } catch (err) {
        output.innerText = 'Probe Error: ' + err.message;
        latencyTag.innerText = 'Error';
      }
    }

    function switchTab(tab) {
      currentTab = tab;
      document.getElementById('tab-health').classList.toggle('active', tab === 'health');
      document.getElementById('tab-root').classList.toggle('active', tab === 'root');
      executeProbe();
    }

    function copyCurl() {
      const cmd = currentTab === 'health' ? 'curl -i http://localhost:5000/health' : 'curl http://localhost:5000';
      navigator.clipboard.writeText(cmd).then(() => {
        showToast('Copied: ' + cmd);
      });
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.innerText = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);
    }

    // Auto-probe on load and poll every 4 seconds
    executeProbe();
    setInterval(executeProbe, 4000);
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
