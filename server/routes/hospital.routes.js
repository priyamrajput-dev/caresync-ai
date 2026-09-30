import { Router } from 'express';
import {
  listHospitals,
  getHospitalDetail,
  getHospitalInventory,
  getHospitalAlerts,
  getHospitalRisk,
  getHospitalOrders,
} from '../controllers/hospital.controller.js';

const router = Router();

router.get('/', listHospitals);
router.get('/:hospital_id', getHospitalDetail);
router.get('/:hospital_id/inventory', getHospitalInventory);
router.get('/:hospital_id/alerts', getHospitalAlerts);
router.get('/:hospital_id/risk', getHospitalRisk);
router.get('/:hospital_id/orders', getHospitalOrders);

export default router;

