import Anthropic from "@anthropic-ai/sdk";
import type { GenerateInput, GenerateResult, LLMAdapter } from "./types";

const DEFAULT_MODEL = process.env.LLM_MODEL || "claude-sonnet-4-6";

/**
 * API adapter — uses the Anthropic SDK with ANTHROPIC_API_KEY.
 * This is the production path; swap LLM_PROVIDER=api once a key is set.
 */
export class ApiAdapter implements LLMAdapter {
  readonly provider = "api" as const;
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "LLM_PROVIDER=api requires ANTHROPIC_API_KEY to be set in the environment.",
      );
    }
    this.client = new Anthropic({ apiKey });
  }

  async generate(input: GenerateInput): Promise<GenerateResult> {
    const model = input.model || DEFAULT_MODEL;
    const start = Date.now();

    const message = await this.client.messages.create({
      model,
      max_tokens: 4096,
      system: input.system,
      messages: [{ role: "user", content: input.prompt }],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return {
      text,
      provider: this.provider,
      model,
      elapsedMs: Date.now() - start,
    };
  }
}
