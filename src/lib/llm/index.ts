import { ApiAdapter } from "./api";
import { CliAdapter } from "./cli";
import { MockAdapter } from "./mock";
import type { LLMAdapter, LLMProvider } from "./types";

export type { GenerateInput, GenerateResult, LLMAdapter, LLMProvider } from "./types";

let cached: LLMAdapter | null = null;

/**
 * Resolve the configured LLM adapter. Selection is driven by LLM_PROVIDER:
 *   cli (default) → CliAdapter   api → ApiAdapter   mock → MockAdapter
 */
export function getAdapter(): LLMAdapter {
  if (cached) return cached;

  const provider = (process.env.LLM_PROVIDER || "cli").toLowerCase() as LLMProvider;
  switch (provider) {
    case "api":
      cached = new ApiAdapter();
      break;
    case "mock":
      cached = new MockAdapter();
      break;
    case "cli":
    default:
      cached = new CliAdapter();
      break;
  }
  return cached;
}
