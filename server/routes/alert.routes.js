import { Router } from 'express';
import { listAlerts, acknowledgeAlert, resolveAlert } from '../controllers/alert.controller.js';


const router = Router();

router.get('/', listAlerts);
router.post('/:id/acknowledge', acknowledgeAlert);
router.patch('/:id/acknowledge', acknowledgeAlert);
router.patch('/:id/resolve', resolveAlert);
router.post('/:id/resolve', resolveAlert);


export default router;
