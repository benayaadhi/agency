import { spawn } from "node:child_process";
import type { GenerateInput, GenerateResult, LLMAdapter } from "./types";

/**
 * CLI adapter — shells out to the locally installed `claude` binary in
 * non-interactive print mode. This lets you test the whole agency for free
 * using an existing Claude Code session, before wiring up an API key.
 *
 * A handful of CLAUDE_CODE_* environment variables that the parent process
 * may have set will break `claude -p`, so we strip them from the child env.
 */
const STRIP_ENV = [
  "CLAUDE_CODE_INCLUDE_PARTIAL_MESSAGES",
  "CLAUDECODE",
  "CLAUDE_CODE_ENTRYPOINT",
];

const DEFAULT_MODEL = process.env.LLM_MODEL || "claude-sonnet-4-6";

export class CliAdapter implements LLMAdapter {
  readonly provider = "cli" as const;

  generate(input: GenerateInput): Promise<GenerateResult> {
    const model = input.model || DEFAULT_MODEL;
    const bin = process.env.CLAUDE_CLI_PATH || "claude";
    const start = Date.now();

    const env: NodeJS.ProcessEnv = { ...process.env };
    for (const key of STRIP_ENV) delete env[key];

    const args = [
      "-p",
      input.prompt,
      "--model",
      model,
      // Disable all tools so the model answers inline instead of behaving like
      // a coding agent (otherwise it tries to "write files" and asks for approval).
      "--tools",
      "",
      "--append-system-prompt",
      input.system,
    ];

    return new Promise((resolve, reject) => {
      const child = spawn(bin, args, { env });
      let stdout = "";
      let stderr = "";

      const timeout = setTimeout(() => {
        child.kill("SIGKILL");
        reject(new Error("claude CLI timed out after 180s"));
      }, 180_000);

      child.stdout.on("data", (d) => (stdout += d.toString()));
      child.stderr.on("data", (d) => (stderr += d.toString()));
      child.on("error", (err) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to spawn '${bin}': ${err.message}`));
      });
      child.on("close", (code) => {
        clearTimeout(timeout);
        if (code !== 0) {
          reject(
            new Error(
              `claude CLI exited with code ${code}: ${stderr || stdout}`.trim(),
            ),
          );
          return;
        }
        resolve({
          text: stdout.trim(),
          provider: this.provider,
          model,
          elapsedMs: Date.now() - start,
        });
      });
    });
  }
}
