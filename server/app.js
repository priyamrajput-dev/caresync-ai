import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { standardRateLimiter } from './middleware/rateLimit.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import procurementRoutes from './routes/procurement.routes.js';
import alertRoutes from './routes/alert.routes.js';
import dischargeRoutes from './routes/discharge.routes.js';
import aiRoutes from './routes/ai.routes.js';
import vectorRoutes from './routes/vector.routes.js';
import workflowRoutes from './routes/workflow.routes.js';

// Legacy controller aliases for exact backward compatibility with source FastAPI endpoints
import { chat, getAgentLogs } from './controllers/ai.controller.js';

const app = express();

// Trust proxy for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// CORS configuration
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
            if (!origin) return callback(null, true);
            if (env.CORS_ORIGINS.includes('*') || env.CORS_ORIGINS.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, true); // Dev-friendly fallback
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }),
);

// Body parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Global standard rate limiter
app.use('/api', standardRateLimiter);

// JWT session inspection middleware
app.use(authenticate);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'caresync-api',
        stack: 'MERN',
        timestamp: new Date().toISOString(),
    });
});

// Direct backward-compatible top-level routes matching original FastAPI contracts
app.post('/api/chat', chat);
app.get('/api/agent-logs', getAgentLogs);

// API route mounts
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/discharges', dischargeRoutes);
app.use('/api/discharge', dischargeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/vector', vectorRoutes);
app.use('/api/workflow', workflowRoutes);

// Catch-all 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'ROUTE_NOT_FOUND',
            message: `The endpoint ${req.method} ${req.originalUrl} does not exist on this server.`,
        },
    });
});

// Centralized error handler
app.use(errorHandler);

export default app;
