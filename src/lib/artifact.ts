/**
 * Pulls a renderable HTML artifact out of an agent's deliverable.
 * Agents like Nova return a self-contained HTML document inside a ```html
 * fence; everything else is treated as Markdown notes.
 */
export interface Artifact {
  html: string | null;
  notes: string;
}

const FENCE = /```html\s*\n([\s\S]*?)```/i;

export function extractArtifact(text: string): Artifact {
  const m = text.match(FENCE);
  if (m) {
    const html = m[1].trim();
    const notes = (text.slice(0, m.index) + text.slice((m.index ?? 0) + m[0].length)).trim();
    return { html, notes };
  }
  // A bare HTML document with no fence.
  if (/<!doctype html|<html[\s>]/i.test(text)) {
    return { html: text.trim(), notes: "" };
  }
  return { html: null, notes: text };
}
