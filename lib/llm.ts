// TokenHarbor — the ONLY LLM provider for FinQuest.
// All 3 values come from env, nothing is hard-coded except the defaults:
//   TOKENHARBOR_API_KEY     — your TokenHarbor API key
//   TOKENHARBOR_BASE_URL    — default https://api.tokenharbor.ai/v1
//   TOKENHARBOR_MODEL       — default mimo-v2.6-flash:free
// Back-compat aliases (used only if the TOKENHARBOR_* vars are missing):
//   OPENAI_API_KEY / LLM_BASE_URL / OPENAI_MODEL

export type LlmConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  configured: boolean;
};

export function getLlmConfig(): LlmConfig {
  const apiKey = process.env.TOKENHARBOR_API_KEY || process.env.OPENAI_API_KEY || "";
  const baseUrl = (process.env.TOKENHARBOR_BASE_URL || process.env.LLM_BASE_URL || "https://api.tokenharbor.ai/v1").replace(/\/$/, "");
  const model = process.env.TOKENHARBOR_MODEL || process.env.OPENAI_MODEL || "mimo-v2.6-flash:free";
  return { apiKey, baseUrl, model, configured: !!apiKey };
}

export function llmPublicInfo() {
  const c = getLlmConfig();
  return { configured: c.configured, baseUrl: c.baseUrl, model: c.model };
}
