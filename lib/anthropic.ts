import Anthropic from '@anthropic-ai/sdk';

// Token-economy decision: haiku for extraction (3× cheaper), sonnet for analysis
export const EXTRACTION_MODEL = 'claude-haiku-4-5' as const;
export const ANALYSIS_MODEL = 'claude-sonnet-4-6' as const;

export const MAX_PAGES_PER_PDF = 30;

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}
