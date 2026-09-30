import { Router } from 'express';
import { chat, forecast, ragQuery, getAgentLogs } from '../controllers/ai.controller.js';
import { aiRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/chat', aiRateLimiter, chat);
router.get('/forecast/:hospitalId', forecast);
router.post('/rag', aiRateLimiter, ragQuery);
router.get('/logs', getAgentLogs);

export default router;
