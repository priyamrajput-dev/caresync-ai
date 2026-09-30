import { Alert } from '../models/Alert.js';
import { errorResponse, successResponse } from '../utils/response.js';

export async function listAlerts(req, res, next) {
    try {
        const { status, severity, hospitalId } = req.query;
        const query = {};
        if (status && status !== 'all') query.status = status;
        if (severity && severity !== 'all') query.severity = severity;
        if (hospitalId) query.hospitalId = hospitalId;

        const alerts = await Alert.find(query).sort({ createdAt: -1 }).lean();

        const formattedAlerts = alerts.map((a) => ({
            id: a._id.toString(),
            _id: a._id.toString(),
            hospitalId: a.hospitalId ? a.hospitalId.toString() : null,
            hospital: a.hospitalName,
            resource: a.resourceName,
            type: a.alertType,
            severity: a.severity,
            message: a.message,
            status: a.status,
            acknowledged: a.status === 'acknowledged',
            createdAt: a.createdAt,
            resolvedAt: a.resolvedAt,
        }));

        return res.status(200).json({
            success: true,
            alerts: formattedAlerts,
            data: formattedAlerts,
            message: 'Alerts retrieved',
        });
    } catch (err) {
        next(err);
    }
}

export async function acknowledgeAlert(req, res, next) {
    try {
        const { id } = req.params;
        const { acknowledged_by } = req.body || {};
        const alert = await Alert.findByIdAndUpdate(
            id,
            {
                status: 'acknowledged',
                acknowledgedBy: req.user?.id || acknowledged_by || 'Operator',
                acknowledgedAt: new Date(),
            },
            { new: true },
        ).lean();

        if (!alert) {
            return errorResponse(res, 'Alert not found', 404, 'NOT_FOUND');
        }

        return res.status(200).json({
            success: true,
            data: {
                ...alert,
                acknowledged: true,
            },
            alert,
            message: 'Alert acknowledged successfully',
        });
    } catch (err) {
        next(err);
    }
}

export async function resolveAlert(req, res, next) {
    try {
        const { id } = req.params;
        const alert = await Alert.findByIdAndUpdate(
            id,
            {
                status: 'resolved',
                resolvedAt: new Date(),
                resolvedBy: req.user?.id || null,
            },
            { new: true },
        ).lean();

        if (!alert) {
            return errorResponse(res, 'Alert not found', 404, 'NOT_FOUND');
        }

        return res.status(200).json({
            success: true,
            data: alert,
            alert,
            message: 'Alert resolved successfully',
        });
    } catch (err) {
        next(err);
    }
}
