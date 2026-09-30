import { logger } from '../../utils/logger.js';

export class GuardrailsService {
  constructor() {
    this.maxMessageLength = 2000;
    this.maxAgentTurns = 6;
    this.maxToolExecutionsPerTurn = 5;

    // Known prompt injection patterns
    this.injectionPatterns = [
      /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
      /you\s+are\s+now\s+in\s+developer\s+mode/i,
      /system\s*prompt\s*override/i,
      /jailbreak/i,
      /bypass\s+all\s+filters/i,
      /forget\s+your\s+rules/i,
    ];

    this.clinicalDisclaimer =
      '\n\n*Notice: CareSync AI provides operational intelligence and decision-support assistance. It is not a substitute for clinical diagnosis, prescribing authority, or professional medical advice.*';
  }

  get CLINICAL_DISCLAIMER() {
    return this.clinicalDisclaimer;
  }

  /**
   * Validates and sanitizes user input before passing to AI agent.
   */
  validateInput(message) {
    if (!message || typeof message !== 'string') {
      return { isValid: false, error: 'User message must be a non-empty string.' };
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return { isValid: false, error: 'User message cannot be empty.' };
    }

    if (trimmed.length > this.maxMessageLength) {
      return {
        isValid: false,
        error: `Message exceeds maximum allowed length of ${this.maxMessageLength} characters.`,
      };
    }

    for (const pattern of this.injectionPatterns) {
      if (pattern.test(trimmed)) {
        logger.warn('Prompt injection attempt detected and blocked:', trimmed.slice(0, 80));
        return {
          isValid: false,
          error: 'Input contains prohibited operational override or prompt injection patterns.',
        };
      }
    }

    return { isValid: true, sanitized: trimmed };
  }

  /**
   * Sanitizes and appends safety disclaimers to the final AI output.
   */
  sanitizeOutput(text, appendDisclaimer = false) {
    if (!text || typeof text !== 'string') return '';
    let sanitized = text;

    // Check if output includes hallucinated certainty on clinical treatments
    if (sanitized.includes('I guarantee') || sanitized.includes('100% cure')) {
      sanitized = sanitized.replace(/I guarantee|100% cure/gi, 'Operational data suggests');
    }

    if (appendDisclaimer && !sanitized.includes('CareSync AI provides operational intelligence')) {
      sanitized += this.clinicalDisclaimer;
    }

    return sanitized;
  }

  /**
   * Validates structured JSON returned by LLM.
   */
  validateStructuredOutput(rawJson, requiredKeys = []) {
    try {
      const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
      if (!parsed || typeof parsed !== 'object') {
        return { isValid: false, error: 'Malformed output: expected JSON object.' };
      }
      for (const key of requiredKeys) {
        if (parsed[key] === undefined) {
          return { isValid: false, error: `Missing required key: ${key}` };
        }
      }
      return { isValid: true, data: parsed };
    } catch (err) {
      return { isValid: false, error: `Failed to parse JSON: ${err.message}` };
    }
  }
}

export const guardrailsService = new GuardrailsService();

