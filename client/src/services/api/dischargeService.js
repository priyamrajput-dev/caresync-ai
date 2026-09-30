import { request } from './apiClient.js';

export const dischargeService = {
  async getDischarges() {
    const res = await request('/discharges');
    return res.discharges || (Array.isArray(res.data) ? res.data : res.data?.discharges) || [];
  },

  async getDischarge(dischargeId) {
    const res = await request(`/discharges/${dischargeId}`);
    return res.discharge || res.data?.discharge || res.data;
  },

  async createDischarge(dischargeData) {
    const res = await request('/discharges', {
      method: 'POST',
      body: JSON.stringify(dischargeData),
    });
    return res.discharge || res.data?.discharge || res.data || res;
  },
};
