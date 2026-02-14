import { checkDatabaseConnection } from '../config/db.js';
import { ENV } from '../config/env.js';

export async function getHealth(_req, res) {
  const dbCheck = await checkDatabaseConnection();

  const response = {
    status: 'success',
    service: 'PaisaPilot API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: ENV.NODE_ENV,
    database: {
      status: !ENV.DATABASE_URL
        ? 'unconfigured'
        : dbCheck.connected
        ? 'connected'
        : 'disconnected',
      latency: dbCheck.latencyMs ? `${dbCheck.latencyMs}ms` : undefined,
      message: dbCheck.message,
    },
  };

  res.status(200).json(response);
}
