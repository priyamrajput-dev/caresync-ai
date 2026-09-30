import { Hospital, Inventory, Resource, Supplier, SupplierResource, ProcurementOrder, Alert, RiskScore } from '../../models/index.js';
import { vectorService } from './vector.service.js';
import { logger } from '../../utils/logger.js';
import mongoose from 'mongoose';

export class ToolService {
  constructor() {
    this.tools = [
      {
        name: 'get_hospital_metrics',
        description: 'Get real-time operational metrics for a hospital: oxygen %, ICU occupancy %, pharma %, and current risk score.',
        parameters: {
          type: 'object',
          properties: {
            hospital_id: {
              type: 'string',
              description: 'Hospital ID or name fragment (e.g., "AIIMS", "PGIMER", "Tata").',
            },
          },
          required: ['hospital_id'],
        },
      },
      {
        name: 'get_inventory_status',
        description: 'Get detailed inventory for all resources at a hospital including unit, current level, capacity, warning and critical thresholds, status, and trend.',
        parameters: {
          type: 'object',
          properties: {
            hospital_id: {
              type: 'string',
              description: 'Hospital ID or name fragment.',
            },
          },
          required: ['hospital_id'],
        },
      },
      {
        name: 'search_suppliers',
        description: 'Find active suppliers that can provide a specific medical resource. Returns suppliers sorted by reliability score.',
        parameters: {
          type: 'object',
          properties: {
            resource_name: {
              type: 'string',
              description: 'Resource to search for (e.g., "oxygen", "pharmaceuticals", "ventilators").',
            },
            max_lead_time_days: {
              type: 'number',
              description: 'Filter suppliers with lead time less than or equal to this value (default 7).',
            },
          },
          required: ['resource_name'],
        },
      },
      {
        name: 'get_active_alerts',
        description: 'Get all open and acknowledged alerts for a hospital, sorted with most critical first.',
        parameters: {
          type: 'object',
          properties: {
            hospital_id: {
              type: 'string',
              description: 'Hospital ID or name fragment.',
            },
          },
          required: ['hospital_id'],
        },
      },
      {
        name: 'create_procurement_order',
        description: 'Draft a purchase order for a hospital. The order remains in DRAFT status until human approval. Requires explicit user confirmation.',
        parameters: {
          type: 'object',
          properties: {
            hospital_id: {
              type: 'string',
              description: 'Hospital ID or name fragment.',
            },
            supplier_id: {
              type: 'string',
              description: 'Supplier ID from search_suppliers results.',
            },
            resource_name: {
              type: 'string',
              description: 'Name of the resource to order (e.g., "oxygen").',
            },
            quantity: {
              type: 'number',
              description: 'Number of units to order.',
            },
            notes: {
              type: 'string',
              description: 'Clinical justification or order notes.',
            },
            user_confirmed: {
              type: 'boolean',
              description: 'MUST be true ONLY if user explicitly approved all draft details in chat.',
            },
          },
          required: ['hospital_id', 'supplier_id', 'resource_name', 'quantity', 'user_confirmed'],
        },
      },
      {
        name: 'get_procurement_orders',
        description: 'Get recent procurement orders for a hospital.',
        parameters: {
          type: 'object',
          properties: {
            hospital_id: {
              type: 'string',
              description: 'Hospital ID or name fragment.',
            },
            status: {
              type: 'string',
              description: 'Filter by status: "all", "draft", "submitted", "approved", "delivered".',
            },
          },
          required: ['hospital_id'],
        },
      },
      {
        name: 'search_vector_knowledge',
        description: 'Retrieve healthcare clinical guidelines, supplier intelligence, and outbreak reports using MongoDB Atlas Vector Search.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Natural language search query.',
            },
            category: {
              type: 'string',
              description: 'Optional category: "guideline", "supplier_intel", "outbreak_news", "protocol".',
            },
          },
          required: ['query'],
        },
      },
    ];
  }

  getToolDefinitions() {
    return this.tools;
  }

  async executeTool(toolName, args, context = {}) {
    logger.info(`Executing AI Tool: ${toolName}`, args);
    try {
      switch (toolName) {
        case 'get_hospital_metrics':
          return await this._getHospitalMetrics(args.hospital_id);
        case 'get_inventory_status':
          return await this._getInventoryStatus(args.hospital_id);
        case 'search_suppliers':
          return await this._searchSuppliers(args.resource_name, args.max_lead_time_days);
        case 'get_active_alerts':
          return await this._getActiveAlerts(args.hospital_id);
        case 'create_procurement_order':
          return await this._createProcurementOrder(args, context);
        case 'get_procurement_orders':
          return await this._getProcurementOrders(args.hospital_id, args.status);
        case 'search_vector_knowledge':
          return await this._searchVectorKnowledge(args.query, args.category);
        default:
          return { error: `Unknown tool: ${toolName}` };
      }
    } catch (err) {
      logger.error(`Tool execution error [${toolName}]:`, err.message);
      return { error: err.message };
    }
  }

  // --- Tool Implementations ---

  async _resolveHospital(hospitalQuery) {
    if (!hospitalQuery) return null;
    if (mongoose.Types.ObjectId.isValid(hospitalQuery)) {
      const h = await Hospital.findById(hospitalQuery).lean();
      if (h) return h;
    }
    // Search by name substring
    return await Hospital.findOne({
      name: { $regex: hospitalQuery, $options: 'i' },
      isActive: true,
    }).lean();
  }

  async _getHospitalMetrics(hospitalQuery) {
    const hospital = await this._resolveHospital(hospitalQuery);
    if (!hospital) {
      return { error: `No active hospital found matching '${hospitalQuery}'` };
    }

    const inventoryItems = await Inventory.find({ hospitalId: hospital._id }).lean();
    const risk = await RiskScore.findOne({ hospitalId: hospital._id }).sort({ calculatedAt: -1 }).lean();

    const metrics = {
      hospital_id: hospital._id.toString(),
      hospital_name: hospital.name,
      region: hospital.regionName || hospital.country,
      occupancy: hospital.occupancy,
      efficiency: hospital.efficiency,
      risk_score: risk ? risk.score : 25.0,
      risk_level: risk ? risk.riskLevel : 'low',
      resources: {},
    };

    for (const item of inventoryItems) {
      metrics.resources[item.resourceName] = {
        level: item.currentLevel,
        status: item.status,
      };
    }

    return metrics;
  }

  async _getInventoryStatus(hospitalQuery) {
    const hospital = await this._resolveHospital(hospitalQuery);
    if (!hospital) {
      return [{ error: `No active hospital found matching '${hospitalQuery}'` }];
    }

    const items = await Inventory.find({ hospitalId: hospital._id })
      .populate('resourceId')
      .sort({ currentLevel: 1 })
      .lean();

    const trendMap = { '-1': 'declining', '0': 'stable', '1': 'improving' };

    return items.map(item => ({
      inventory_id: item._id.toString(),
      resource: item.resourceName,
      unit: item.resourceId?.unit || 'units',
      current_level: item.currentLevel,
      capacity_total: item.capacityTotal,
      status: item.status,
      trend: trendMap[item.trend] || 'stable',
      warning_threshold: item.resourceId?.warningThreshold || 70,
      critical_threshold: item.resourceId?.criticalThreshold || 40,
      last_updated: item.lastUpdatedAt,
    }));
  }

  async _searchSuppliers(resourceName, maxLeadTimeDays = 7) {
    const resource = await Resource.findOne({
      name: { $regex: resourceName, $options: 'i' },
    }).lean();

    if (!resource) {
      return [{ message: `Resource '${resourceName}' not found in catalog.` }];
    }

    const supplierResources = await SupplierResource.find({ resourceId: resource._id })
      .populate({
        path: 'supplierId',
        match: {
          isActive: true,
          leadTimeDays: { $lte: maxLeadTimeDays || 30 },
        },
      })
      .lean();

    const validSuppliers = supplierResources
      .filter(sr => sr.supplierId)
      .map(sr => ({
        supplier_id: sr.supplierId._id.toString(),
        supplier_name: sr.supplierId.name,
        reliability_score: sr.supplierId.reliabilityScore,
        lead_time_days: sr.supplierId.leadTimeDays,
        logistics_risk_score: sr.supplierId.logisticsRiskScore,
        contact_email: sr.supplierId.contactEmail,
        country: sr.supplierId.country,
        resource: resource.name,
        unit: resource.unit,
        unit_price: sr.unitPrice,
        available_quantity: sr.availableQuantity,
      }));

    validSuppliers.sort((a, b) => b.reliability_score - a.reliability_score);

    return validSuppliers.length > 0
      ? validSuppliers
      : [{ message: `No active suppliers found for '${resourceName}' within ${maxLeadTimeDays} days lead time.` }];
  }

  async _getActiveAlerts(hospitalQuery) {
    const hospital = await this._resolveHospital(hospitalQuery);
    if (!hospital) {
      return [{ error: `No hospital found matching '${hospitalQuery}'` }];
    }

    const alerts = await Alert.find({
      hospitalId: hospital._id,
      status: { $in: ['open', 'acknowledged'] },
    })
      .sort({ createdAt: -1 })
      .lean();

    const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 };

    return alerts
      .map(a => ({
        alert_id: a._id.toString(),
        type: a.alertType,
        severity: a.severity,
        message: a.message,
        status: a.status,
        resource: a.resourceName,
        created_at: a.createdAt,
      }))
      .sort((a, b) => (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99));
  }

  async _createProcurementOrder(args, context = {}) {
    const { hospital_id, supplier_id, resource_name, quantity, notes = '', user_confirmed } = args;

    if (!user_confirmed) {
      return {
        error: 'Order creation rejected: user_confirmed is false.',
        required_confirmation: ['hospital', 'supplier', 'resource', 'quantity', 'estimated_total'],
        next_step: 'Present the order draft to the user and request explicit confirmation before calling this tool again.',
      };
    }

    const hospital = await this._resolveHospital(hospital_id);
    if (!hospital) return { error: `Hospital '${hospital_id}' not found` };

    const supplier = await Supplier.findById(supplier_id).lean();
    if (!supplier || !supplier.isActive) return { error: `Active supplier '${supplier_id}' not found` };

    const resource = await Resource.findOne({ name: { $regex: resource_name, $options: 'i' } }).lean();
    if (!resource) return { error: `Resource '${resource_name}' not found` };

    const supplierResource = await SupplierResource.findOne({
      supplierId: supplier._id,
      resourceId: resource._id,
    }).lean();

    if (!supplierResource) {
      return { error: `Supplier '${supplier.name}' does not supply '${resource.name}'` };
    }

    if (supplierResource.availableQuantity < quantity) {
      return {
        error: `Supplier only has ${supplierResource.availableQuantity} units available; requested ${quantity}.`,
      };
    }

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (supplier.leadTimeDays || 3));

    const order = await ProcurementOrder.create({
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      supplierId: supplier._id,
      supplierName: supplier.name,
      resourceId: resource._id,
      resourceName: resource.name,
      quantity,
      unitPrice: supplierResource.unitPrice,
      totalCost: quantity * supplierResource.unitPrice,
      status: 'draft',
      createdBy: context.userId || null,
      createdByName: context.userName || 'Autonomous Procurement Agent',
      estimatedDelivery,
      notes: notes || 'Drafted by CareSync AI Agent. Human approval required.',
    });

    return {
      order_id: order._id.toString(),
      order_number: order.orderNumber,
      status: 'draft',
      hospital_name: hospital.name,
      supplier_name: supplier.name,
      resource: resource.name,
      quantity,
      unit_price: supplierResource.unitPrice,
      estimated_total: order.totalCost,
      lead_time_days: supplier.leadTimeDays,
      message: 'Draft order created successfully. Human approval required prior to vendor dispatch.',
    };
  }

  async _getProcurementOrders(hospitalQuery, status = 'all') {
    const hospital = await this._resolveHospital(hospitalQuery);
    if (!hospital) return [{ error: `Hospital '${hospitalQuery}' not found` }];

    const query = { hospitalId: hospital._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await ProcurementOrder.find(query).sort({ createdAt: -1 }).limit(20).lean();

    return orders.map(o => ({
      order_id: o._id.toString(),
      order_number: o.orderNumber,
      resource: o.resourceName,
      supplier: o.supplierName,
      quantity: o.quantity,
      unit_price: o.unitPrice,
      total_cost: o.totalCost,
      status: o.status,
      created_at: o.createdAt,
      estimated_delivery: o.estimatedDelivery,
      notes: o.notes,
    }));
  }

  async _searchVectorKnowledge(query, category) {
    const results = await vectorService.searchSimilar(query, { limit: 4, category });
    return results.map(r => ({
      title: r.chunk.title,
      category: r.chunk.category,
      content: r.chunk.content,
      region: r.chunk.region,
      relevance_score: Math.round(r.score * 100) / 100,
    }));
  }
}

export const toolService = new ToolService();
