import { request } from './apiClient.js';

export const alertService = {
  async getAlerts(params = {}) {
    const searchParams = new URLSearchParams(params).toString();
    const res = await request(`/alerts${searchParams ? `?${searchParams}` : ''}`);
    return res.alerts || (Array.isArray(res.data) ? res.data : res.data?.alerts) || [];
  },

  async acknowledgeAlert(alertId, acknowledgedBy = 'Duty Operator') {
    return await request(`/alerts/${alertId}/acknowledge`, {
      method: 'PATCH',
      body: JSON.stringify({ acknowledged_by: acknowledgedBy }),
    });
  },

  async resolveAlert(alertId) {
    return await request(`/alerts/${alertId}/resolve`, {
      method: 'PATCH',
    });
  },
};
