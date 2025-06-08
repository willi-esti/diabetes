import dotenv from 'dotenv';
import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { loggingMiddleware } from './middleware/logger';
import { setRoutes } from './routes/index';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Trust the first proxy
app.set('trust proxy', 'loopback');

// CORS Middleware
app.use(corsMiddleware);

// Logging Middleware
app.use(loggingMiddleware);

setRoutes(app);

app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});
