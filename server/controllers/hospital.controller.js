import { hospitalService } from '../services/business/hospital.service.js';
import { inventoryService } from '../services/business/inventory.service.js';
import { procurementService } from '../services/business/procurement.service.js';
import { Alert, RiskScore } from '../models/index.js';
import { errorResponse } from '../utils/response.js';

export async function listHospitals(req, res, next) {
  try {
    const hospitals = await hospitalService.getAllHospitals();
    return res.status(200).json({
      success: true,
      data: hospitals,
      hospitals,
    });
  } catch (err) {
    next(err);
  }
}

export async function getHospitalDetail(req, res, next) {
  try {
    const { hospital_id } = req.params;
    const hospital = await hospitalService.getHospitalById(hospital_id);
    if (!hospital) {
      return errorResponse(res, 'Hospital not found', 404, 'NOT_FOUND');
    }
    const inventory = await inventoryService.getHospitalInventory(hospital_id);
    return res.status(200).json({
      success: true,
      data: {
        hospital,
        inventory: inventory?.inventory || inventory || [],
      },
      hospital,
      inventory: inventory?.inventory || inventory || [],
    });
  } catch (err) {
    next(err);
  }
}


export async function getHospitalInventory(req, res, next) {
  try {
    const { hospital_id } = req.params;
    const data = await inventoryService.getHospitalInventory(hospital_id);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getHospitalAlerts(req, res, next) {
  try {
    const { hospital_id } = req.params;
    const { status = 'active' } = req.query;

    const hospital = await hospitalService.getHospitalById(hospital_id);
    if (!hospital) {
      return errorResponse(res, 'Hospital not found', 404, 'NOT_FOUND');
    }

    const query = { hospitalId: hospital._id };
    if (status === 'active') {
      query.status = { $in: ['open', 'acknowledged'] };
    } else if (status !== 'all') {
      query.status = status;
    }

    const alerts = await Alert.find(query).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      hospital: {
        id: hospital._id.toString(),
        name: hospital.name,
      },
      alerts: alerts.map(a => ({
        id: a._id.toString(),
        hospital_id: hospital._id.toString(),
        hospital: a.hospitalName,
        resource: a.resourceName,
        type: a.alertType,
        severity: a.severity,
        message: a.message,
        status: a.status,
        created_at: a.createdAt,
        resolved_at: a.resolvedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getHospitalRisk(req, res, next) {
  try {
    const { hospital_id } = req.params;
    const hospital = await hospitalService.getHospitalById(hospital_id);
    if (!hospital) {
      return errorResponse(res, 'Hospital not found', 404, 'NOT_FOUND');
    }

    const risk = await RiskScore.findOne({ hospitalId: hospital._id }).sort({ calculatedAt: -1 }).lean();

    return res.status(200).json({
      hospital: {
        id: hospital._id.toString(),
        name: hospital.name,
      },
      risk: risk
        ? {
            score: risk.score,
            risk_level: risk.riskLevel,
            contributing_factors: risk.contributingFactors,
            calculated_at: risk.calculatedAt,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
}

export async function getHospitalOrders(req, res, next) {
  try {
    const { hospital_id } = req.params;
    const { status = 'all' } = req.query;

    const orders = await procurementService.getOrders({
      hospitalId: hospital_id,
      status,
      limit: 20,
    });

    return res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
}
