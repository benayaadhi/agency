import type { GenerateInput, GenerateResult, LLMAdapter } from "./types";

/**
 * Mock adapter — no AI calls. Returns a templated, plausible-looking
 * deliverable so the game is fully playable offline and in CI.
 */
export class MockAdapter implements LLMAdapter {
  readonly provider = "mock" as const;

  async generate(input: GenerateInput): Promise<GenerateResult> {
    const start = Date.now();
    // Simulate think time so the "working" animation is visible.
    await new Promise((r) => setTimeout(r, 1200));

    const title = input.system.split("\n")[0]?.replace(/^#\s*/, "") || "Agent";
    const text = [
      `## ${title} — Demo Deliverable`,
      "",
      `> Running in **mock mode** (no AI key configured). Set \`LLM_PROVIDER=cli\` or \`api\` for real output.`,
      "",
      `**Brief received:** ${input.prompt}`,
      "",
      "### Recommended approach",
      "1. Clarify the core objective and target audience.",
      "2. Draft three angles and pressure-test them against the brief.",
      "3. Ship the strongest angle with clear success metrics.",
      "",
      "### Next steps",
      "- Align with the Strategy room on positioning.",
      "- Hand off to Creative for execution.",
      "- Track results in Analytics.",
    ].join("\n");

    return {
      text,
      provider: this.provider,
      model: "mock",
      elapsedMs: Date.now() - start,
    };
  }
}
