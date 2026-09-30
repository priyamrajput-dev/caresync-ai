import { llmService } from './llm.service.js';
import { toolService } from './tool.service.js';
import { guardrailsService } from './guardrails.service.js';
import { buildSystemPrompt } from '../../prompts/agent.prompt.js';
import { ChatSession, AgentLog, Agent } from '../../models/index.js';
import { logger } from '../../utils/logger.js';

export class AgentService {
  constructor() {
    this.maxTurns = 6;
  }

  /**
   * Runs the autonomous ReAct agent loop for a user turn.
   *
   * @param {Object} params
   * @param {string} params.message - Current user message
   * @param {Array} [params.history=[]] - Previous conversation messages
   * @param {string} [params.hospitalId] - Focused facility ID
   * @param {string} [params.userId] - Authenticated user ID
   * @param {string} [params.sessionId] - Chat session ID for persistence
   * @returns {Promise<{response: string, toolCalls: Array, tokensUsed: number, sessionId: string}>}
   */
  async runAgent({ message, history = [], hospitalId = null, userId = null, sessionId = null }) {
    // 1. Input Guardrail
    const inputValidation = guardrailsService.validateInput(message);
    if (!inputValidation.isValid) {
      return {
        response: `⚠️ Input validation alert: ${inputValidation.error}`,
        toolCalls: [],
        tokensUsed: 0,
        sessionId,
      };
    }
    const cleanUserMessage = inputValidation.sanitized;

    // 2. Prepare Context & Session
    let session = null;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
    }
    if (!session && userId) {
      session = await ChatSession.create({
        userId,
        hospitalId: hospitalId || null,
        title: cleanUserMessage.slice(0, 40) + '...',
        messages: [],
      });
    }

    const systemPrompt = buildSystemPrompt(hospitalId);
    const tools = toolService.getToolDefinitions();

    // Prepare message history
    const conversationMessages = [];
    if (history && history.length > 0) {
      for (const turn of history) {
        if (turn.role === 'user' || turn.role === 'assistant') {
          conversationMessages.push({
            role: turn.role,
            content: turn.content,
          });
        }
      }
    } else if (session && session.messages.length > 0) {
      for (const turn of session.messages.slice(-10)) {
        conversationMessages.push({
          role: turn.role,
          content: turn.content,
        });
      }
    }

    conversationMessages.push({
      role: 'user',
      content: cleanUserMessage,
    });

    // 3. Autonomous ReAct Execution Loop
    let turnCount = 0;
    const executedToolCalls = [];
    let totalTokens = 0;
    let finalResponseText = '';

    while (turnCount < this.maxTurns) {
      turnCount++;
      logger.info(`Agent turn ${turnCount}/${this.maxTurns}`);

      let stepResult;
      try {
        stepResult = await llmService.callWithTools({
          systemPrompt,
          messages: conversationMessages,
          tools,
          maxTokens: 1024,
          temperature: 0.1,
        });
      } catch (err) {
        logger.error('Agent LLM call failed:', err.message);
        finalResponseText = `I encountered an unexpected issue while communicating with the AI service: ${err.message}. Please verify the operational metrics directly from the dashboard.`;
        break;
      }

      if (stepResult.usage?.total_tokens) {
        totalTokens += stepResult.usage.total_tokens;
      }

      // Check if tool calls were requested
      if (!stepResult.toolCalls || stepResult.toolCalls.length === 0) {
        finalResponseText = stepResult.text || 'Operational assessment completed.';
        break;
      }

      // Tool calls were triggered: execute each tool
      conversationMessages.push({
        role: 'assistant',
        content: stepResult.text || '',
        tool_calls: stepResult.toolCalls,
      });

      for (const toolCall of stepResult.toolCalls) {
        const toolOutput = await toolService.executeTool(toolCall.name, toolCall.args, {
          userId,
          hospitalId,
        });

        executedToolCalls.push({
          tool: toolCall.name,
          input: toolCall.args,
          output: toolOutput,
        });

        conversationMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolOutput),
        });

        // Telemetry: record agent log
        try {
          const procurementAgent = await Agent.findOne({ agentType: 'procurement' }).lean();
          if (procurementAgent) {
            await AgentLog.create({
              agentId: procurementAgent._id,
              agentName: procurementAgent.name,
              agentType: procurementAgent.agentType,
              hospitalId: hospitalId || null,
              severity: toolOutput.error ? 'warning' : 'info',
              message: `Executed tool '${toolCall.name}' for query: "${cleanUserMessage.slice(0, 60)}"`,
              metadata: { tool: toolCall.name, args: toolCall.args },
            });
          }
        } catch (logErr) {
          logger.debug('Failed to record agent telemetry log:', logErr.message);
        }
      }
    }

    if (!finalResponseText && turnCount >= this.maxTurns) {
      finalResponseText = 'Agent reached maximum operational iterations. All initiated checks were concluded.';
    }

    // 4. Output Guardrail & Safety Disclaimer
    const sanitizedResponse = guardrailsService.sanitizeOutput(finalResponseText, true);

    // 5. Persist Session if available
    if (session) {
      session.messages.push({
        role: 'user',
        content: cleanUserMessage,
      });
      session.messages.push({
        role: 'assistant',
        content: sanitizedResponse,
        toolCalls: executedToolCalls,
        tokensUsed: totalTokens,
      });
      session.totalTokens += totalTokens;
      session.lastActivityAt = new Date();
      await session.save();
    }

    return {
      response: sanitizedResponse,
      toolCalls: executedToolCalls,
      tokensUsed: totalTokens,
      sessionId: session ? session._id.toString() : null,
    };
  }
}

export const agentService = new AgentService();


