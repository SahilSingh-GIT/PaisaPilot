import { ENV } from '../config/env.js';

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${err.name || 'Server Error'}: ${message}`);

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(ENV.isDev && { stack: err.stack }),
  });
}
