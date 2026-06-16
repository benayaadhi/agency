# 🏢 Agency Tycoon

> Your AI marketing agency — played like a game.

Send a brief, watch a specialist agent **walk into their room**, sit down to
work, and hand you back a real marketing deliverable. It's a tiny isometric
office (Sims-style) where each room is a department staffed by an AI agent with
its own personality and concrete output.

Inspired by [`msitarzewski/agency-agents`](https://github.com/msitarzewski/agency-agents):
each agent is a personality-driven persona with a clear mission and opinionated
deliverables — not a generic chatbot.

---

## ✨ What it does

- **Real 3D office** rendered with [react-three-fiber](https://docs.pmnd.rs/react-three-fiber)
  (Three.js): orbit the camera, animated low-poly people who walk room-to-room,
  desks, chairs, monitors — all built-in, **no asset downloads required**.
  Drop in Sketchfab/Mixamo `.glb` files to level it up — see [MODELS.md](MODELS.md).
- **5 departments**, each with a named specialist:
  | Room | Agent | Role |
  |------|-------|------|
  | 🧠 Strategy | Sloane | Chief Strategy Officer |
  | 🎨 Creative | Vex | Creative Director |
  | 📱 Social Media | Pixel | Social Media Strategist |
  | 📊 Analytics | Ada | Head of Analytics |
  | 💰 Finance | Cash | Finance Controller |
  | 🎬 Motion Studio | Nova | Motion Designer (outputs **live animated HTML**) |
- **Game loop:** pick a room → type a brief → the agent walks to the meeting
  table, works, then walks back while the deliverable streams into a side panel.
- **Live motion-graphic preview:** when an agent (e.g. Nova) returns a
  self-contained HTML document, the panel renders it **live in a sandboxed
  iframe** with a Preview ↔ Code toggle — animated visuals you can watch, not
  just describe.
- **Pluggable AI engine** via a single env var (`LLM_PROVIDER`):
  - `cli` — shells out to your local `claude` CLI. **Free to test** with an
    existing Claude Code session, no API key needed.
  - `api` — Anthropic API using `ANTHROPIC_API_KEY` (production path).
  - `mock` — templated demo output, fully offline.

---

## 🚀 Quick start

```bash
npm install
cp .env.example .env.local   # defaults to LLM_PROVIDER=cli
npm run dev                  # http://localhost:3000
```

Then: drag to orbit / scroll to zoom the 3D office, click a room (or a chip at
the bottom), type a brief, hit **Send brief** (or ⌘/Ctrl + Enter). Watch the
agent walk to the meeting table, work, and walk back as the deliverable appears.

### Testing for free with the Claude CLI

The default `LLM_PROVIDER=cli` calls the locally installed `claude` binary in
print mode, so you can play the whole agency using your Claude Code session
before paying for an API key. Requires the `claude` CLI on your `PATH`.

### Switching to the API for production

```bash
# .env.local
LLM_PROVIDER=api
ANTHROPIC_API_KEY=sk-ant-...
LLM_MODEL=claude-sonnet-4-6
```

---

## 🧱 Architecture

```
src/
├── agents/registry.ts        # the "staff": personas, rooms, colors, prompts
├── lib/llm/                   # pluggable AI backend
│   ├── index.ts               #   adapter selector (cli | api | mock)
│   ├── cli.ts  api.ts  mock.ts
│   └── types.ts
├── app/
│   ├── api/generate/route.ts  # POST { agentId, brief } → deliverable
│   └── page.tsx               # the game screen
├── game/
│   ├── iso.ts                 # vector math (stepToward, distance)
│   ├── office.ts              # floor plan: rooms, desks, walk paths
│   └── store.ts               # Zustand state + motion tick (assign→walk→work→back)
└── components/
    ├── three/                 # 3D scene: Scene, Character3D, Room3D, Furniture3D
    │   └── models.ts          # optional .glb slots (Sketchfab/Mixamo/Quaternius)
    ├── Stage.tsx              # client-only dynamic loader for the WebGL scene
    └── Roster, BriefBar, DeliverablePanel, Markdown
```

The grid coordinates in `office.ts` map straight into 3D world space
(`grid x → world x`, `grid y → world z`), so the same motion system drives both
the logic and the on-screen characters.

**Flow:** `BriefBar` → `store.assign()` sets the agent walking and POSTs to
`/api/generate` → the route picks the configured adapter and runs the agent's
persona prompt → the result reveals in `DeliverablePanel` once the character
arrives at the meeting table.

---

## 🧩 Adding a new department

Add an entry to `src/agents/registry.ts` (id, room name, agent, color, prompt)
and a matching room layout (rect, desk, door) in `src/game/office.ts`. That's it
— the roster, chips, office tiles, and routing all read from those two files.

## 🗺️ Roadmap ideas

- Token streaming straight from the CLI/API (currently a typewriter reveal).
- A "CEO" router that auto-picks the right department for a brief.
- Agents collaborating (Strategy → Creative → Social hand-offs in one run).
- Persist briefs & deliverables; export a campaign as one document.
- Isometric sprite art and richer office furniture.

---

Built with Next.js (App Router), React, TypeScript, and Zustand.
