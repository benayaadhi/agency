/**
 * Optional 3D asset slots. Out of the box everything is rendered with
 * built-in low-poly geometry (no downloads needed). To upgrade to real
 * Sketchfab / Mixamo / Quaternius models, drop a `.glb` into `public/models/`
 * and point the matching slot here. See MODELS.md for sourcing + steps.
 *
 * Character glb notes:
 *  - Use a rigged, animated humanoid (Mixamo export works great).
 *  - Provide clip names for walk/idle if your file uses non-standard names.
 */
export interface ModelConfig {
  /** Shared character model used for every agent (tinted per-agent). */
  character: string | null;
  /** Animation clip names inside the character glb. */
  characterClips: { idle?: string; walk?: string };
  desk: string | null;
  chair: string | null;
  table: string | null;
}

export const MODELS: ModelConfig = {
  character: null,
  characterClips: { idle: "Idle", walk: "Walking" },
  desk: null,
  chair: null,
  table: null,
};
