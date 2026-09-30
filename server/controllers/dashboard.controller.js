import { hospitalService } from '../services/business/hospital.service.js';
import { successResponse } from '../utils/response.js';

export async function getSummary(req, res, next) {
  try {
    const summary = await hospitalService.getDashboardSummary();
    return res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
}

