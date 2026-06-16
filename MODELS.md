# Upgrading to real 3D models (Sketchfab / Mixamo / Quaternius)

Out of the box the office renders **built-in low-poly geometry** — animated
people, desks, chairs, monitors — with **zero downloads**. You can swap any of
them for real `.glb` assets without touching the rendering code.

## How it works

1. Put your `.glb` files in `public/models/`.
2. Point the matching slot in [`src/components/three/models.ts`](src/components/three/models.ts):

```ts
export const MODELS: ModelConfig = {
  character: "/models/agent.glb",          // a rigged, animated humanoid
  characterClips: { idle: "Idle", walk: "Walking" }, // clip names inside the glb
  desk: "/models/desk.glb",
  chair: "/models/chair.glb",
  table: "/models/table.glb",
};
```

That's it — `Character3D` and `Furniture3D` pick up the glb automatically and
fall back to the built-in geometry for any slot left `null`.

## Where to get free assets

> ⚠️ The sandbox these were built in blocks Sketchfab/Mixamo/poly.pizza, so the
> downloads below are something **you** do locally, then drop into `public/models/`.

### People (animated) — Mixamo (free, Adobe account)
1. Go to <https://www.mixamo.com>.
2. Pick a character (e.g. "Y Bot") → **Download** as FBX, or use a glb pipeline.
3. Add animations: search **Idle** and **Walking**, download "With Skin".
4. Convert FBX → glb (e.g. <https://github.com/facebookincubator/FBX2glTF> or
   Blender export). Keep the clip names and set them in `characterClips`.

Mixamo characters are free for commercial/non-commercial use.

### People & furniture — Quaternius (CC0, no login)
<https://quaternius.com> — "Ultimate Modular Characters" + furniture packs.
Already `.glb`, CC0 (no attribution required). Easiest path for both people and props.

### Furniture / props — Sketchfab (mixed licenses)
<https://sketchfab.com> — filter **Downloadable** + license **CC Attribution**
or **CC0**. Download the **glTF/glb**. Credit the author per the license.

### Furniture / props — Poly Pizza (CC0/CC-BY, no login)
<https://poly.pizza> — quick CC0 desks, chairs, plants. Direct `.glb` download.

## Tips

- **Scale**: 1 grid unit = 1 world unit (~1 meter). Resize in Blender or pass a
  `scale` to the prop if a model imports too big/small.
- **Performance**: keep characters under ~20k triangles; you have 5 on screen.
- **Animations**: only rigged glbs animate. If your character has no clips it
  will simply stand (still better-looking than the primitive). The built-in
  procedural human always animates as a fallback.
- **Licensing**: keep attribution for CC-BY assets in this file or a credits
  screen.
