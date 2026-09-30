import { Inventory, Resource, Hospital } from '../../models/index.js';

export class InventoryService {
  async getHospitalInventory(hospitalId) {
    const hospital = await Hospital.findById(hospitalId).lean();
    if (!hospital) throw new Error('Hospital not found');

    const inventory = await Inventory.find({ hospitalId })
      .populate('resourceId')
      .sort({ currentLevel: 1 })
      .lean();

    const trendLabel = { '-1': 'declining', '0': 'stable', '1': 'improving' };

    return {
      hospital: {
        id: hospital._id.toString(),
        name: hospital.name,
        occupancy: hospital.occupancy,
        efficiency: hospital.efficiency,
      },
      inventory: inventory.map(item => ({
        id: item._id.toString(),
        hospital_id: hospital._id.toString(),
        resource_id: item.resourceId?._id?.toString(),
        resource: item.resourceName,
        category: item.resourceId?.category || 'device',
        unit: item.resourceId?.unit || 'percentage',
        current_level: item.currentLevel,
        capacity_total: item.capacityTotal,
        status: item.status,
        trend: trendLabel[item.trend] || 'stable',
        warning_threshold: item.resourceId?.warningThreshold || 70,
        critical_threshold: item.resourceId?.criticalThreshold || 40,
        last_updated_at: item.lastUpdatedAt,
      })),
    };
  }

  async updateInventoryLevel(hospitalId, resourceId, newLevel) {
    const resource = await Resource.findById(resourceId).lean();
    if (!resource) throw new Error('Resource not found');

    let status = 'stable';
    if (newLevel <= resource.criticalThreshold) {
      status = 'critical';
    } else if (newLevel <= resource.warningThreshold) {
      status = 'warning';
    }

    const updated = await Inventory.findOneAndUpdate(
      { hospitalId, resourceId },
      {
        currentLevel: newLevel,
        status,
        lastUpdatedAt: new Date(),
      },
      { new: true }
    );

    return updated;
  }
}

export const inventoryService = new InventoryService();
