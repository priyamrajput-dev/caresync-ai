import { request } from './apiClient.js';

export const procurementService = {
  async getOrders(params = {}) {
    const searchParams = new URLSearchParams(params).toString();
    const res = await request(`/procurement/orders${searchParams ? `?${searchParams}` : ''}`);
    return res.orders || (Array.isArray(res.data) ? res.data : res.data?.orders) || [];
  },

  async createOrder(orderData) {
    const res = await request('/procurement/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return res.order || res.data?.order || res.data || res;
  },

  async updateOrderStatus(orderId, status) {
    const res = await request(`/procurement/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.order || res.data?.order || res.data || res;
  },
};
