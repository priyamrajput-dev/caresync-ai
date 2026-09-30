import { Router } from 'express';
import { listDischarges, createDischarge } from '../controllers/discharge.controller.js';

const router = Router();

router.get('/', listDischarges);
router.post('/', createDischarge);
router.get('/summaries', listDischarges);
router.post('/generate', createDischarge);

export default router;
