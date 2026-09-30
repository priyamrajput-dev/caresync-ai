import { Router } from 'express';
import { search, ingest } from '../controllers/vector.controller.js';
import { ragQuery } from '../controllers/ai.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/search', search);
router.post('/query', ragQuery);
router.post('/ingest', requireAuth, requireRole(['admin', 'operator']), ingest);

export default router;
