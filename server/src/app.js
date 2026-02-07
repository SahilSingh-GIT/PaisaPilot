import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

export function createApp() {
  const app = express();

  // Foundational Security & Parsing Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: [ENV.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,//used to send data like cookies, localstorage, url data
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (ENV.isDev) {
    app.use(morgan('dev'));
  }

  // API Routes
  app.use('/api', routes);

  // 404 & Central Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
