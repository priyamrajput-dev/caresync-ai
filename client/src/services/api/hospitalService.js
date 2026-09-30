import { request } from './apiClient.js';

export const hospitalService = {
  async getDashboardSummary() {
    const res = await request('/dashboard/summary');
    return res.data || res;
  },

  async getHospitals() {
    const res = await request('/hospitals');
    return res.hospitals || (Array.isArray(res.data) ? res.data : res.data?.hospitals) || [];
  },

  async getHospitalDetail(hospitalId) {
    const res = await request(`/hospitals/${hospitalId}`);
    return res.hospital || res.data?.hospital || res.data || res;
  },

  async getInventory(hospitalId) {
    const res = await request(`/hospitals/${hospitalId}/inventory`);
    return {
      inventory: res.inventory || res.data?.inventory || (Array.isArray(res) ? res : res.data) || [],
      hospital_name: res.hospital_name || res.data?.hospital_name,
      hospital_id: res.hospital_id || res.data?.hospital_id || hospitalId,
    };
  },

  async getAlerts(hospitalId, status = 'active') {
    const res = await request(`/hospitals/${hospitalId}/alerts?status=${status}`);
    return res.alerts || (Array.isArray(res.data) ? res.data : res.data?.alerts) || [];
  },

  async getRisk(hospitalId) {
    const res = await request(`/hospitals/${hospitalId}/risk`);
    return res.risk_score || res.data?.risk_score || res.data || res;
  },

  async getOrders(hospitalId, status = 'all') {
    const res = await request(`/hospitals/${hospitalId}/orders?status=${status}`);
    return res.orders || (Array.isArray(res.data) ? res.data : res.data?.orders) || [];
  },
};
