// LLM Provider Configuration for FinQuest.
// Generates fresh questions and smart AI verdicts in real-time.

import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Environments without node:dns
}

export type LlmConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  configured: boolean;
};

const FALLBACK_API_KEY =
  "thk_live_ZmQxJ-SRwsorGCHOX2O8NUYOAVT4hX2VyDwYXtuuyQ_oFVCldmp86HIPdmnqcjJC";

export function getLlmConfig(): LlmConfig {
  const apiKey =
    process.env.TOKENHARBOR_API_KEY ||
    process.env.OPENAI_API_KEY ||
    FALLBACK_API_KEY;

  let baseUrl = (
    process.env.TOKENHARBOR_BASE_URL ||
    process.env.LLM_BASE_URL ||
    "https://tokenharbor.ai/v1"
  )
    .replace(/\/$/, "")
    .replace("https://api.tokenharbor.ai", "https://tokenharbor.ai");

  const model =
    process.env.TOKENHARBOR_MODEL ||
    process.env.OPENAI_MODEL ||
    "mimo-v2.6-flash:free";

  return { apiKey, baseUrl, model, configured: !!apiKey };
}

export function llmPublicInfo() {
  const c = getLlmConfig();
  return { configured: c.configured, baseUrl: c.baseUrl, model: c.model };
}
