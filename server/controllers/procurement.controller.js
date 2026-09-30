import { procurementService } from '../services/business/procurement.service.js';
import { Resource, Supplier, SupplierResource } from '../models/index.js';
import { errorResponse } from '../utils/response.js';

export async function listOrders(req, res, next) {
  try {
    const { hospital_id, status = 'all', limit = 20 } = req.query;
    const orders = await procurementService.getOrders({
      hospitalId: hospital_id,
      status,
      limit: parseInt(limit, 10),
    });
    return res.status(200).json({
      success: true,
      data: orders,
      orders,
    });
  } catch (err) {
    next(err);
  }
}

export async function createOrder(req, res, next) {
  try {
    let { hospital_id, hospitalId, supplier_id, supplierId, resource_id, resourceId, resource_name, resourceName, resource_type, resourceType, quantity, notes } = req.body;
    hospital_id = hospital_id || hospitalId;
    supplier_id = supplier_id || supplierId;
    resource_id = resource_id || resourceId;
    const resName = resource_name || resourceName || resource_type || resourceType;

    if (!hospital_id || (!resource_id && !resName) || !quantity) {
      return errorResponse(res, 'hospital_id, resource, and quantity are required', 400, 'VALIDATION_ERROR');
    }

    if (!supplier_id) {
      const resDoc = await Resource.findOne({ name: { $regex: resName, $options: 'i' } });
      if (resDoc) {
        const link = await SupplierResource.findOne({ resourceId: resDoc._id }).sort({ unitPrice: 1 });
        if (link) supplier_id = link.supplierId;
      }
      if (!supplier_id) {
        const anySupp = await Supplier.findOne({ isActive: true });
        if (anySupp) supplier_id = anySupp._id;
      }
    }

    const result = await procurementService.createOrder({
      hospitalId: hospital_id,
      supplierId: supplier_id,
      resourceId: resource_id,
      resourceName: resName,
      quantity: parseInt(quantity, 10),
      notes,
      user: req.user,
    });

    const orderData = result.order || result;
    const responsePayload = {
      ...orderData,
      _id: orderData.id || orderData._id,
      order_id: orderData.order_number || orderData.id || orderData._id,
    };

    return res.status(201).json({
      success: true,
      data: responsePayload,
      order: responsePayload,
      message: 'Order created',
    });

  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 'Status is required', 400, 'VALIDATION_ERROR');
    }

    const updated = await procurementService.updateOrderStatus(order_id, status);
    return res.status(200).json({
      success: true,
      data: updated,
      order: updated,
      message: 'Order status updated',
    });
  } catch (err) {
    next(err);
  }
}
