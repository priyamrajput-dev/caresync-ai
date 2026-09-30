import { request } from './apiClient.js';

export const aiService = {
  /**
   * Send a chat query to the autonomous ReAct agent.
   * Supports both positional parameters and object parameter syntax.
   */
  async chat(messageOrParams, historyOrHospital = [], hospitalId = null, sessionId = null) {
    let payload;

    if (typeof messageOrParams === 'object' && messageOrParams !== null) {
      payload = {
        message: messageOrParams.message || messageOrParams.query,
        history: messageOrParams.history || [],
        hospital_id: messageOrParams.hospital_id || messageOrParams.hospitalId || null,
        session_id: messageOrParams.session_id || messageOrParams.sessionId || null,
      };
    } else {
      payload = {
        message: messageOrParams,
        history: Array.isArray(historyOrHospital) ? historyOrHospital : [],
        hospital_id: typeof historyOrHospital === 'string' ? historyOrHospital : hospitalId,
        session_id: sessionId,
      };
    }

    const res = await request('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      response: res.response || res.data?.response || 'Telemetry analysis generated.',
      toolCalls: res.toolCalls || res.tool_calls || res.data?.toolCalls || res.data?.tool_calls || [],
      tokensUsed: res.tokensUsed || res.tokens_used || res.data?.tokensUsed || 0,
      sessionId: res.sessionId || res.session_id || res.data?.sessionId,
      data: res.data || res,
    };
  },

  /**
   * Alias for chat matching legacy signature.
   */
  async sendMessage(params) {
    return await this.chat(params);
  },

  /**
   * Executes background clinical & shortage workflows.
   * e.g. runWorkflow('shortage-assessment', { threshold: 40 })
   */
  async runWorkflow(workflowType, params = {}) {
    const res = await request(`/workflow/${workflowType}`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return res.data || res;
  },

  /**
   * Vector Search over clinical protocols, guidelines, and supplier intelligence.
   */
  async ragSearch(query, options = {}) {
    const res = await request('/ai/rag', {
      method: 'POST',
      body: JSON.stringify({ query, ...options }),
    });

    const data = res.data || res;
    return {
      chunks: data.chunks || [],
      response: data.response || '',
      query: data.query || query,
      data,
    };
  },

  /**
   * Forecast hospital supply burn rates.
   */
  async getForecast(hospitalId) {
    const res = await request(`/ai/forecast/${hospitalId}`);
    return res.data || res;
  },

  /**
   * Retrieve autonomous agent operational logs.
   */
  async getAgentLogs(limit = 20) {
    const res = await request(`/agent-logs?limit=${limit}`);
    return res.logs || res.data?.logs || [];
  },
};
