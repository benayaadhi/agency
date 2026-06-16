"use client";

import { create } from "zustand";
import { AGENTS } from "@/agents/registry";
import {
  pathToDesk,
  pathToMeeting,
  ROOMS_BY_ID,
} from "./office";
import { type Point, stepToward } from "./iso";

export type AgentStatus = "idle" | "out" | "work" | "back";

export interface AgentRuntime {
  id: string;
  pos: Point;
  waypoints: Point[];
  status: AgentStatus;
  /** Facing 1 = toward +x (right-ish), -1 = toward -x. */
  facing: number;
  /** Walk bob phase. */
  bob: number;
  hasResult: boolean;
  workUntil: number;
}

export interface Deliverable {
  agentId: string;
  text: string;
  provider: string;
  model: string;
  elapsedMs: number;
  at: number;
}

interface GameState {
  agents: Record<string, AgentRuntime>;
  selectedId: string | null;
  busyId: string | null;
  brief: string;
  deliverables: Record<string, Deliverable>;
  activeDeliverableId: string | null;
  error: string | null;
  providerInfo: { provider: string; model: string } | null;

  // actions
  setBrief: (brief: string) => void;
  selectRoom: (id: string | null) => void;
  setProviderInfo: (info: { provider: string; model: string }) => void;
  openDeliverable: (id: string) => void;
  closeDeliverable: () => void;
  assign: (agentId: string, brief: string) => Promise<void>;
  tick: (dt: number) => void;
}

const WALK_SPEED = 4.2; // grid units / second
const MIN_WORK_MS = 900;

function initialAgents(): Record<string, AgentRuntime> {
  const out: Record<string, AgentRuntime> = {};
  for (const a of AGENTS) {
    const desk = ROOMS_BY_ID[a.id]?.desk ?? { x: 0, y: 0 };
    out[a.id] = {
      id: a.id,
      pos: { ...desk },
      waypoints: [],
      status: "idle",
      facing: 1,
      bob: 0,
      hasResult: false,
      workUntil: 0,
    };
  }
  return out;
}

export const useGame = create<GameState>((set, get) => ({
  agents: initialAgents(),
  selectedId: null,
  busyId: null,
  brief: "",
  deliverables: {},
  activeDeliverableId: null,
  error: null,
  providerInfo: null,

  setBrief: (brief) => set({ brief }),
  selectRoom: (id) => set({ selectedId: id }),
  setProviderInfo: (providerInfo) => set({ providerInfo }),
  openDeliverable: (id) => set({ activeDeliverableId: id }),
  closeDeliverable: () => set({ activeDeliverableId: null }),

  assign: async (agentId, brief) => {
    const state = get();
    if (state.busyId) return; // one job at a time, keep it readable
    const agent = state.agents[agentId];
    if (!agent) return;

    set((s) => ({
      busyId: agentId,
      error: null,
      activeDeliverableId: null,
      agents: {
        ...s.agents,
        [agentId]: {
          ...s.agents[agentId],
          status: "out",
          hasResult: false,
          waypoints: pathToMeeting(agentId),
        },
      },
    }));

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, brief }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      set((s) => ({
        deliverables: {
          ...s.deliverables,
          [agentId]: {
            agentId,
            text: data.text,
            provider: data.provider,
            model: data.model,
            elapsedMs: data.elapsedMs,
            at: Date.now(),
          },
        },
        agents: {
          ...s.agents,
          [agentId]: { ...s.agents[agentId], hasResult: true },
        },
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      set((s) => ({
        error: message,
        busyId: null,
        agents: {
          ...s.agents,
          [agentId]: {
            ...s.agents[agentId],
            status: "back",
            waypoints: pathToDesk(agentId),
          },
        },
      }));
    }
  },

  tick: (dt) => {
    const s = get();
    const step = WALK_SPEED * dt;
    let changed = false;
    let revealId: string | null = null;
    let clearBusy = false;
    const next: Record<string, AgentRuntime> = {};

    for (const id of Object.keys(s.agents)) {
      const a = s.agents[id];
      if (a.status === "idle" || a.status === "work") {
        // Possibly transition work → back.
        if (
          a.status === "work" &&
          a.hasResult &&
          Date.now() >= a.workUntil
        ) {
          next[id] = {
            ...a,
            status: "back",
            waypoints: pathToDesk(id),
          };
          revealId = id;
          changed = true;
        } else {
          next[id] = a;
        }
        continue;
      }

      // Walking states: advance toward next waypoint.
      const target = a.waypoints[0];
      if (!target) {
        // Arrived at end of path.
        if (a.status === "out") {
          next[id] = { ...a, status: "work", workUntil: Date.now() + MIN_WORK_MS };
        } else {
          // finished walking back
          next[id] = { ...a, status: "idle" };
          clearBusy = true;
        }
        changed = true;
        continue;
      }

      const moved = stepToward(a.pos, target, step);
      const reached =
        Math.abs(moved.x - target.x) < 1e-3 &&
        Math.abs(moved.y - target.y) < 1e-3;
      const facing = target.x > a.pos.x ? 1 : target.x < a.pos.x ? -1 : a.facing;
      next[id] = {
        ...a,
        pos: moved,
        facing,
        bob: a.bob + dt * 10,
        waypoints: reached ? a.waypoints.slice(1) : a.waypoints,
      };
      changed = true;
    }

    if (!changed) return;
    set((prev) => ({
      agents: next,
      activeDeliverableId: revealId ?? prev.activeDeliverableId,
      busyId: clearBusy ? null : prev.busyId,
    }));
  },
}));
