import { agentService } from '../services/ai/agent.service.js';
import { workflowService } from '../services/ai/workflow.service.js';
import { ragService } from '../services/ai/rag.service.js';
import { AgentLog } from '../models/AgentLog.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export async function chat(req, res, next) {
  try {
    const { message, history = [], hospital_id, session_id, user_id } = req.body;

    if (!message || typeof message !== 'string') {
      return errorResponse(res, 'message string is required', 400, 'VALIDATION_ERROR');
    }

    logger.info(`Chat request received | hospital=${hospital_id || 'none'} | session=${session_id || 'none'} | length=${message.length}`);

    const result = await agentService.runAgent({
      message,
      history,
      hospitalId: hospital_id || req.user?.hospitalId,
      userId: user_id || req.user?.id,
      sessionId: session_id,
    });

    // Return exact contract expected by frontend
    return res.status(200).json({
      success: true,
      response: result.response,
      toolCalls: result.toolCalls,
      tool_calls: result.toolCalls,
      tokensUsed: result.tokensUsed,
      tokens_used: result.tokensUsed,
      sessionId: result.sessionId,
      session_id: result.sessionId,
      data: {
        response: result.response,
        toolCalls: result.toolCalls,
        tool_calls: result.toolCalls,
        tokensUsed: result.tokensUsed,
        sessionId: result.sessionId,
      },
    });
  } catch (err) {
    logger.error('Chat controller error:', err);
    next(err);
  }
}

export async function forecast(req, res, next) {
  try {
    const { hospitalId } = req.params;
    const report = await workflowService.runShortageAssessmentWorkflow(hospitalId);
    return successResponse(res, report, 'Shortage forecast calculated');
  } catch (err) {
    next(err);
  }
}

export async function ragQuery(req, res, next) {
  try {
    const { query, category, region, limit } = req.body;
    if (!query) {
      return errorResponse(res, 'query is required', 400, 'VALIDATION_ERROR');
    }

    const result = await ragService.answerWithRetrieval(query, { category, region, limit });
    return successResponse(res, result, 'RAG query executed');
  } catch (err) {
    next(err);
  }
}

export async function getAgentLogs(req, res, next) {
  try {
    const { limit = 20, hospital_id } = req.query;
    const query = {};
    if (hospital_id) query.hospitalId = hospital_id;

    const safeLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
    const logs = await AgentLog.find(query).sort({ createdAt: -1 }).limit(safeLimit).lean();

    return res.status(200).json({
      logs: logs.map(l => ({
        id: l._id.toString(),
        agent: l.agentName,
        agent_type: l.agentType,
        hospital: l.hospitalName,
        hospital_id: l.hospitalId ? l.hospitalId.toString() : null,
        severity: l.severity,
        message: l.message,
        metadata: l.metadata,
        created_at: l.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}
