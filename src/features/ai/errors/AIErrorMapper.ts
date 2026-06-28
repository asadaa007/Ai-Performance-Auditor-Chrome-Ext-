import type { AIResponseError } from '@features/ai/types/response';

export type AIErrorKind =
  | 'insufficient_quota'
  | 'invalid_api_key'
  | 'rate_limit_exceeded'
  | 'context_length_exceeded'
  | 'network_error'
  | 'timeout'
  | 'cancelled'
  | 'configuration'
  | 'unknown';

export interface FriendlyAIError {
  kind: AIErrorKind;
  title: string;
  explanation: string;
  suggestedAction: string;
  technicalDetails: string;
  retryable: boolean;
}

export interface AIErrorInput {
  code?: string;
  message: string;
  retryable?: boolean;
}

interface ErrorTemplate {
  title: string;
  explanation: string;
  suggestedAction: string;
  retryable: boolean;
}

const ERROR_TEMPLATES: Record<AIErrorKind, ErrorTemplate> = {
  insufficient_quota: {
    title: 'No API credits available',
    explanation:
      'Your API key is valid, but your OpenAI API account has no available credits or has reached its usage limit. Please review your billing and usage.',
    suggestedAction: 'Open your provider billing dashboard, add credits, or upgrade your plan.',
    retryable: false,
  },
  invalid_api_key: {
    title: 'Invalid API key',
    explanation: 'The API key is invalid. Please verify it in Settings.',
    suggestedAction:
      'Go to Settings → AI Provider, edit your key, save it, and test the connection.',
    retryable: false,
  },
  rate_limit_exceeded: {
    title: 'Rate limit reached',
    explanation: 'Too many requests have been sent. Please wait a moment and try again.',
    suggestedAction: 'Wait 30–60 seconds, then use Retry.',
    retryable: true,
  },
  context_length_exceeded: {
    title: 'Request too large',
    explanation:
      'The request is too large for the selected model. Try selecting fewer issues or a larger-context model.',
    suggestedAction: 'Choose a model with a larger context window or reduce the audit scope.',
    retryable: false,
  },
  network_error: {
    title: 'Connection failed',
    explanation: 'Unable to reach the AI provider. Check your internet connection.',
    suggestedAction: 'Verify your network, VPN, or firewall settings, then retry.',
    retryable: true,
  },
  timeout: {
    title: 'Request timed out',
    explanation: 'The AI provider took too long to respond.',
    suggestedAction: 'Wait a moment and retry. If this persists, try a faster model.',
    retryable: true,
  },
  cancelled: {
    title: 'Request cancelled',
    explanation: 'The AI request was cancelled before it completed.',
    suggestedAction: 'Start a new Explain & Fix request when you are ready.',
    retryable: true,
  },
  configuration: {
    title: 'AI not configured',
    explanation: 'AI provider settings are incomplete or missing.',
    suggestedAction:
      'Open Settings, configure your provider, save your API key, and test the connection.',
    retryable: false,
  },
  unknown: {
    title: 'Something went wrong',
    explanation: 'The AI provider returned an unexpected error.',
    suggestedAction: 'Review the technical details below, adjust settings if needed, and retry.',
    retryable: true,
  },
};

export class AIErrorMapper {
  map(input: AIErrorInput): FriendlyAIError {
    const kind = this.resolveKind(input);
    const template = ERROR_TEMPLATES[kind];
    const technicalDetails = this.buildTechnicalDetails(input);
    const auditContext = this.auditContextOverride(input.message);

    return {
      kind,
      title: auditContext?.title ?? template.title,
      explanation: auditContext?.explanation ?? template.explanation,
      suggestedAction: auditContext?.suggestedAction ?? template.suggestedAction,
      technicalDetails,
      retryable: auditContext?.retryable ?? input.retryable ?? template.retryable,
    };
  }

  private auditContextOverride(
    message: string,
  ): (Pick<FriendlyAIError, 'title' | 'explanation' | 'suggestedAction'> & {
    retryable?: boolean;
  }) | null {
    const lower = message.toLowerCase();

    if (lower.includes('no completed audit is available for the active tab')) {
      return {
        title: 'Audit data not found',
        explanation:
          'AI Explain needs the audit snapshot for this report. The request was sent without a snapshot id.',
        suggestedAction:
          'Reload the report from the extension after an audit completes, then try Explain again.',
      };
    }

    if (lower.includes('no audit snapshot is available for this report')) {
      return {
        title: 'Snapshot not found',
        explanation: 'The immutable audit snapshot for this report could not be loaded.',
        suggestedAction: 'Run a new audit from the popup and open the report again.',
      };
    }

    if (
      lower.includes('background worker sleeps') ||
      lower.includes('lost connection to cursor')
    ) {
      return {
        title: 'Cursor connection interrupted',
        explanation:
          'The extension lost its background connection while waiting for the Cursor cloud agent. Test Connection only checks a quick ping — Explain runs a full agent that can take up to a minute.',
        suggestedAction:
          'Keep this tab open, click Retry, and wait. If it keeps failing, reload the extension at chrome://extensions and try again.',
      };
    }

    if (
      lower.includes('feature_unavailable') ||
      lower.includes('storage mode is disabled') ||
      lower.includes('privacy mode (legacy)')
    ) {
      return {
        title: 'Cursor storage mode is off',
        explanation:
          'Your Cursor account has storage disabled (often called Privacy Mode Legacy or Ghost Mode). The Cloud Agents API needs server-side storage to run agents — Test Connection still works because it only calls GET /v1/me.',
        suggestedAction:
          'In the Cursor app go to Settings → Privacy and switch to Privacy Mode (not Legacy/Ghost). Or open cursor.com/settings and enable storage for agents. Team accounts: an admin must change the org privacy setting. Then retry Explain.',
        retryable: false,
      };
    }

    return null;
  }

  mapResponseError(error: AIResponseError): FriendlyAIError {
    return this.map({
      code: error.code,
      message: error.message,
      retryable: error.retryable,
    });
  }

  private resolveKind(input: AIErrorInput): AIErrorKind {
    const signals = this.extractSignals(input.code ?? '', input.message);

    if (signals.includes('insufficient_quota') || signals.includes('billing_hard_limit_reached')) {
      return 'insufficient_quota';
    }
    if (
      signals.includes('invalid_api_key') ||
      signals.includes('incorrect_api_key') ||
      signals.includes('authentication_error') ||
      signals.includes('invalid x-api-key') ||
      signals.includes('unauthorized') ||
      signals.includes('401')
    ) {
      return 'invalid_api_key';
    }
    if (
      signals.includes('rate_limit_exceeded') ||
      signals.includes('rate limit') ||
      signals.includes('too many requests') ||
      signals.includes('429')
    ) {
      return 'rate_limit_exceeded';
    }
    if (
      signals.includes('context_length_exceeded') ||
      signals.includes('context length') ||
      signals.includes('maximum context') ||
      signals.includes('token limit') ||
      signals.includes('prompt is too long')
    ) {
      return 'context_length_exceeded';
    }
    if (
      signals.includes('aborterror') ||
      signals.includes('timeout') ||
      signals.includes('timed out') ||
      signals.includes('etimedout')
    ) {
      return 'timeout';
    }
    if (signals.includes('cancelled') || signals.includes('canceled')) {
      return 'cancelled';
    }
    if (
      signals.includes('api key is required') ||
      signals.includes('not configured') ||
      signals.includes('provider is not initialized') ||
      signals.includes('no completed audit') ||
      signals.includes('no audit snapshot') ||
      signals.includes('no active tab found for explain')
    ) {
      return 'configuration';
    }
    if (
      signals.includes('network_error') ||
      signals.includes('failed to fetch') ||
      signals.includes('networkerror') ||
      signals.includes('econnrefused') ||
      signals.includes('enotfound') ||
      signals.includes('unable to reach')
    ) {
      return 'network_error';
    }

    return 'unknown';
  }

  private extractSignals(code: string, message: string): string {
    const parts: string[] = [code, message];

    const parsed = this.tryParseProviderJson(message);
    if (parsed) {
      parts.push(parsed.code ?? '', parsed.type ?? '', parsed.message ?? '');
    }

    return parts.join(' ').toLowerCase();
  }

  private tryParseProviderJson(
    message: string,
  ): { code?: string; type?: string; message?: string } | null {
    const trimmed = message.trim();
    if (!trimmed.startsWith('{')) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmed) as {
        error?: { code?: string; type?: string; message?: string };
        message?: string;
      };

      if (parsed.error) {
        return {
          code: parsed.error.code ?? parsed.error.type,
          type: parsed.error.type,
          message: parsed.error.message,
        };
      }

      return { message: parsed.message };
    } catch {
      return null;
    }
  }

  private buildTechnicalDetails(input: AIErrorInput): string {
    const parsed = this.tryParseProviderJson(input.message);
    const lines: string[] = [];

    if (input.code) {
      lines.push(`Code: ${input.code}`);
    }
    if (parsed?.code) {
      lines.push(`Provider code: ${parsed.code}`);
    }
    if (parsed?.message) {
      lines.push(`Provider message: ${parsed.message}`);
    } else {
      lines.push(`Message: ${input.message}`);
    }
    if (parsed && input.message.trim().startsWith('{')) {
      lines.push(`Raw response:\n${input.message}`);
    }

    return lines.join('\n');
  }
}

export const aiErrorMapper = new AIErrorMapper();

export function mapAIError(input: AIErrorInput | AIResponseError | string): FriendlyAIError {
  if (typeof input === 'string') {
    return aiErrorMapper.map({ message: input });
  }
  return aiErrorMapper.map({
    code: input.code,
    message: input.message,
    retryable: input.retryable,
  });
}
