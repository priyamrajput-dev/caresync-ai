import { Router } from 'express';
import { workflowService } from '../services/ai/workflow.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

const router = Router();

router.post('/shortage-assessment', async (req, res, next) => {
  try {
    const { hospitalId, hospital_id, resourceType, resource_type } = req.body;
    const report = await workflowService.runShortageAssessmentWorkflow({
      hospitalId: hospitalId || hospital_id,
      resourceType: resourceType || resource_type,
    });
    return successResponse(res, report, 'Shortage assessment workflow completed');
  } catch (err) {
    next(err);
  }
});

router.post('/discharge-summary', async (req, res, next) => {
  try {
    const { patientName, facilityName, diagnosis, clinicalNotes } = req.body;
    const summary = await workflowService.generateDischargeSummary({
      patientName,
      facilityName,
      diagnosis,
      clinicalNotes,
    });
    return successResponse(res, { summary }, 'Discharge summary workflow completed');
  } catch (err) {
    next(err);
  }
});

export default router;
