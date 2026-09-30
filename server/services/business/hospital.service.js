import { Hospital, Inventory, Alert, RiskScore, AgentLog } from '../../models/index.js';

export class HospitalService {
  async getAllHospitals() {
    const hospitals = await Hospital.find({ isActive: true }).sort({ name: 1 }).lean();

    const results = [];
    for (const h of hospitals) {
      const inventory = await Inventory.find({ hospitalId: h._id }).lean();
      const risk = await RiskScore.findOne({ hospitalId: h._id }).sort({ calculatedAt: -1 }).lean();
      const activeAlertCount = await Alert.countDocuments({
        hospitalId: h._id,
        status: { $in: ['open', 'acknowledged'] },
      });

      let status = 'stable';
      if (inventory.some(i => i.status === 'critical')) {
        status = 'critical';
      } else if (inventory.some(i => i.status === 'warning')) {
        status = 'warning';
      }

      results.push({
        _id: h._id.toString(),
        id: h._id.toString(),
        name: h.name,
        region: h.regionName || h.country,

        country: h.country,
        position: {
          x: h.positionX,
          y: h.positionY,
        },
        occupancy: h.occupancy,
        efficiency: h.efficiency,
        contactEmail: h.contactEmail,
        status,
        activeAlertCount,
        risk: risk
          ? {
              score: risk.score,
              riskLevel: risk.riskLevel,
              contributingFactors: risk.contributingFactors,
              calculatedAt: risk.calculatedAt,
            }
          : null,
      });
    }

    return results;
  }

  async getDashboardSummary() {
    const hospitals = await this.getAllHospitals();
    const inventoryRows = await Inventory.find().lean();
    const activeAlerts = await Alert.find({ status: { $in: ['open', 'acknowledged'] } })
      .sort({ createdAt: -1 })
      .lean();
    const latestLogs = await AgentLog.find().sort({ createdAt: -1 }).limit(10).lean();

    // Calculate resource averages
    const resourceMap = {};
    for (const item of inventoryRows) {
      if (!resourceMap[item.resourceName]) resourceMap[item.resourceName] = [];
      resourceMap[item.resourceName].push(item.currentLevel);
    }

    const averageResourceLevels = {};
    for (const [name, values] of Object.entries(resourceMap)) {
      averageResourceLevels[name] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
    }

    const criticalInventoryCount = inventoryRows.filter(i => i.status === 'critical').length;
    const warningInventoryCount = inventoryRows.filter(i => i.status === 'warning').length;
    const criticalAlertCount = activeAlerts.filter(a => a.severity === 'critical').length;
    const openAlertCount = activeAlerts.filter(a => a.status === 'open').length;

    const avgOccupancy = hospitals.length
      ? Math.round(hospitals.reduce((acc, h) => acc + (h.occupancy || 70), 0) / hospitals.length)
      : 75;

    return {
      totals: {
        hospitals: hospitals.length,
        active_alerts: activeAlerts.length,
        open_alerts: openAlertCount,
        critical_alerts: criticalAlertCount,
        critical_inventory_items: criticalInventoryCount,
        warning_inventory_items: warningInventoryCount,
        avg_occupancy: avgOccupancy,
      },
      average_resource_levels: averageResourceLevels,
      hospitals,
      alerts: activeAlerts.slice(0, 10).map(a => ({
        id: a._id.toString(),
        hospitalId: a.hospitalId ? a.hospitalId.toString() : null,
        hospital: a.hospitalName,
        resource: a.resourceName,
        type: a.alertType,
        severity: a.severity,
        message: a.message,
        status: a.status,
        createdAt: a.createdAt,
      })),
      agent_logs: latestLogs.map(l => ({
        id: l._id.toString(),
        agent: l.agentName,
        agent_type: l.agentType,
        hospital: l.hospitalName,
        severity: l.severity,
        message: l.message,
        metadata: l.metadata,
        createdAt: l.createdAt,
      })),
    };
  }

  async getHospitalById(id) {
    return await Hospital.findById(id).lean();
  }
}

export const hospitalService = new HospitalService();
