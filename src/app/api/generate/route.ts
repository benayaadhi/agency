import { NextResponse } from "next/server";
import { getAdapter } from "@/lib/llm";
import { getAgent } from "@/agents/registry";

export const runtime = "nodejs";
export const maxDuration = 300;

interface Body {
  agentId?: string;
  brief?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { agentId, brief } = body;
  if (!agentId || !brief?.trim()) {
    return NextResponse.json(
      { error: "Both 'agentId' and 'brief' are required." },
      { status: 400 },
    );
  }

  const agent = getAgent(agentId);
  if (!agent) {
    return NextResponse.json(
      { error: `Unknown agent '${agentId}'.` },
      { status: 404 },
    );
  }

  try {
    const adapter = getAdapter();
    const result = await adapter.generate({
      system: agent.systemPrompt,
      prompt: brief.trim(),
    });
    return NextResponse.json({
      text: result.text,
      provider: result.provider,
      model: result.model,
      elapsedMs: result.elapsedMs,
      agent: { id: agent.id, name: agent.name, title: agent.title },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    provider: (process.env.LLM_PROVIDER || "cli").toLowerCase(),
    model: process.env.LLM_MODEL || "claude-sonnet-4-6",
  });
}
