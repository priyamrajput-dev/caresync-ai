import { Router } from 'express';
import {
  listOrders,
  createOrder,
  updateOrderStatus,
} from '../controllers/procurement.controller.js';

const router = Router();

router.get('/orders', listOrders);
router.post('/orders', createOrder);
router.patch('/orders/:order_id/status', updateOrderStatus);
router.get('/order', listOrders);
router.post('/order', createOrder);
router.patch('/order/:order_id/status', updateOrderStatus);


export default router;
