const express = require('express');
const router = express.Router();
const os = require('os');

/**
 * GET /api/health
 * Returns health status of the server
 */
router.get('/', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.round(uptime),
    uptime_formatted: formatUptime(uptime),
    environment: process.env.NODE_ENV || 'development',
    node_version: process.version,
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
      heap_total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      heap_used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB'
    },
    system: {
      platform: process.platform,
      cpus: os.cpus().length,
      free_memory: Math.round(os.freemem() / 1024 / 1024) + ' MB',
      total_memory: Math.round(os.totalmem() / 1024 / 1024) + ' MB'
    },
    services: {
      database: 'connecting...',
      socket_io: 'not_initialized'
    }
  });
});

/**
 * GET /api/health/detailed
 * Returns detailed health information
 */
router.get('/detailed', (req, res) => {
  res.status(200).json({
    status: 'ok',
    server: {
      name: 'Real-Time Chat Application',
      version: '1.0.0',
      mode: process.env.NODE_ENV || 'development'
    },
    started_at: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    uptime_seconds: Math.round(process.uptime()),
    features: {
      websocket: 'socket.io',
      database: 'mongodb',
      authentication: 'jwt',
      real_time_messaging: 'enabled'
    }
  });
});

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

module.exports = router;
