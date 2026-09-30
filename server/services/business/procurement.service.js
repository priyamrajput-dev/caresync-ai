import { ProcurementOrder, Hospital, Supplier, Resource, SupplierResource } from '../../models/index.js';

export class ProcurementService {
  async getOrders({ hospitalId, status = 'all', limit = 20 }) {
    const query = {};
    if (hospitalId) query.hospitalId = hospitalId;
    if (status && status !== 'all') query.status = status;

    const orders = await ProcurementOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 100))
      .lean();

    return orders.map(o => ({
      id: o._id.toString(),
      order_number: o.orderNumber,
      hospital_id: o.hospitalId ? o.hospitalId.toString() : null,
      hospital: o.hospitalName,
      supplier_id: o.supplierId ? o.supplierId.toString() : null,
      supplier: o.supplierName,
      resource: o.resourceName,
      quantity: o.quantity,
      unit_price: o.unitPrice,
      total_cost: o.totalCost,
      status: o.status,
      created_by_name: o.createdByName,
      created_at: o.createdAt,
      estimated_delivery: o.estimatedDelivery,
      delivered_at: o.deliveredAt,
      notes: o.notes,
    }));
  }

  async createOrder({ hospitalId, supplierId, resourceId, resourceName, quantity, notes, user }) {
    const hospital = await Hospital.findById(hospitalId).lean();
    if (!hospital) throw new Error('Hospital not found');

    const supplier = await Supplier.findById(supplierId).lean();
    if (!supplier || !supplier.isActive) throw new Error('Active supplier not found');

    let resource;
    if (resourceId) {
      resource = await Resource.findById(resourceId).lean();
    } else if (resourceName) {
      resource = await Resource.findOne({ name: { $regex: resourceName, $options: 'i' } }).lean();
    }
    if (!resource) throw new Error('Resource not found');

    const supplierResource = await SupplierResource.findOne({
      supplierId: supplier._id,
      resourceId: resource._id,
    }).lean();

    if (!supplierResource) {
      throw new Error(`${supplier.name} does not supply ${resource.name}`);
    }

    if (supplierResource.availableQuantity < quantity) {
      throw new Error(`Supplier only has ${supplierResource.availableQuantity} units available; requested ${quantity}.`);
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
      createdBy: user?.id || null,
      createdByName: user?.name || 'Authorized Staff',
      estimatedDelivery,
      notes: notes || 'Draft purchase order created. Human approval required.',
    });

    return {
      order: {
        id: order._id.toString(),
        order_number: order.orderNumber,
        hospital: hospital.name,
        supplier: supplier.name,
        resource: resource.name,
        quantity,
        unit_price: supplierResource.unitPrice,
        total_cost: order.totalCost,
        status: order.status,
        created_at: order.createdAt,
        estimated_delivery: order.estimatedDelivery,
      },
      message: 'Draft procurement order created. Human approval required before submission.',
    };
  }

  async updateOrderStatus(orderId, nextStatus) {
    const validStatuses = ['draft', 'submitted', 'approved', 'dispatched', 'confirmed', 'delivered', 'cancelled'];
    if (!validStatuses.includes(nextStatus)) {
      throw new Error(`Invalid order status. Allowed: ${validStatuses.join(', ')}`);
    }

    const updateFields = { status: nextStatus };
    if (nextStatus === 'delivered') {
      updateFields.deliveredAt = new Date();
    }

    const updated = await ProcurementOrder.findByIdAndUpdate(orderId, updateFields, { new: true }).lean();
    if (!updated) throw new Error('Procurement order not found');

    return updated;
  }
}

export const procurementService = new ProcurementService();
