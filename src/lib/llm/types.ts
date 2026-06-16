export type LLMProvider = "cli" | "api" | "mock";

export interface GenerateInput {
  /** The full system prompt describing the agent persona. */
  system: string;
  /** The user brief / task to act on. */
  prompt: string;
  /** Optional model override. */
  model?: string;
}

export interface GenerateResult {
  text: string;
  provider: LLMProvider;
  model: string;
  /** Milliseconds the generation took. */
  elapsedMs: number;
}

export interface LLMAdapter {
  readonly provider: LLMProvider;
  generate(input: GenerateInput): Promise<GenerateResult>;
}
