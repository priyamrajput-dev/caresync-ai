import { Discharge, Hospital } from '../models/index.js';
import { workflowService } from '../services/ai/workflow.service.js';
import { errorResponse } from '../utils/response.js';

export async function listDischarges(req, res, next) {
  try {
    const discharges = await Discharge.find().sort({ dischargeDate: -1 }).lean();
    const formatted = discharges.map(d => ({
      id: d._id.toString(),
      _id: d._id.toString(),
      patient: d.patientName,
      facility: d.facilityName,
      hospitalId: d.hospitalId ? d.hospitalId.toString() : null,
      date: d.dischargeDate ? new Date(d.dischargeDate).toLocaleDateString() : 'N/A',
      diagnosis: d.diagnosis,
      summary: d.summary,
      followUpPlan: d.followUpPlan,
      status: d.status,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      discharges: formatted,
    });
  } catch (err) {
    next(err);
  }
}

export async function createDischarge(req, res, next) {
  try {
    const patientName = req.body.patientName || req.body.patient_id || req.body.patient || 'General Inpatient';
    const hospitalId = req.body.hospitalId || req.body.hospital_id;
    const diagnosis = req.body.diagnosis || 'Post-Acute Clinical Stabilization';
    const clinicalNotes = req.body.clinicalNotes || req.body.notes || 'Patient stable on room air.';
    const autoGenerateSummary = req.body.autoGenerateSummary !== false;

    if (!hospitalId) {
      return errorResponse(res, 'hospitalId or hospital_id is required', 400, 'VALIDATION_ERROR');
    }

    const hospital = await Hospital.findById(hospitalId).lean();
    if (!hospital) {
      return errorResponse(res, 'Hospital not found', 404, 'NOT_FOUND');
    }

    let summaryText = req.body.summary;
    if (!summaryText && autoGenerateSummary) {
      summaryText = await workflowService.generateDischargeSummary({
        patientName,
        facilityName: hospital.name,
        diagnosis,
        clinicalNotes,
      });
    }

    const discharge = await Discharge.create({
      patientName,
      hospitalId: hospital._id,
      facilityName: hospital.name,
      diagnosis,
      summary: summaryText || 'Patient stabilized and cleared for discharge.',
      followUpPlan: req.body.followUpPlan || 'Routine clinical follow-up in 7 days.',
    });

    return res.status(201).json({
      success: true,
      data: {
        discharge,
        summary: discharge.summary,
      },
      discharge,
      summary: discharge.summary,
      message: 'Discharge record created',
    });
  } catch (err) {
    next(err);
  }
}
