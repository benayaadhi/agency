"use client";

import React from "react";

/**
 * Tiny, dependency-free Markdown renderer — enough for agent deliverables:
 * headings, bold, inline code, blockquotes, bullet/numbered lists, tables.
 */

function renderInline(text: string, key: React.Key): React.ReactNode {
  // split on **bold** and `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <React.Fragment key={key}>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return <strong key={i}>{p.slice(2, -2)}</strong>;
        }
        if (p.startsWith("`") && p.endsWith("`")) {
          return <code key={i}>{p.slice(1, -1)}</code>;
        }
        return <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </React.Fragment>
  );
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // table block
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[-:\s|]+\|\s*$/.test(lines[i + 1])) {
      const header = line.split("|").slice(1, -1).map((c) => c.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(lines[i].split("|").slice(1, -1).map((c) => c.trim()));
        i++;
      }
      out.push(
        <table key={key++}>
          <thead>
            <tr>{header.map((h, j) => <th key={j}>{renderInline(h, j)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>{r.map((c, ci) => <td key={ci}>{renderInline(c, ci)}</td>)}</tr>
            ))}
          </tbody>
        </table>,
      );
      continue;
    }

    if (line.startsWith("### ")) {
      out.push(<h3 key={key++}>{renderInline(line.slice(4), 0)}</h3>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      out.push(<h2 key={key++}>{renderInline(line.slice(3), 0)}</h2>);
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      out.push(<h2 key={key++}>{renderInline(line.slice(2), 0)}</h2>);
      i++;
      continue;
    }
    if (line.startsWith("> ")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        buf.push(lines[i].slice(2));
        i++;
      }
      out.push(<blockquote key={key++}>{renderInline(buf.join(" "), 0)}</blockquote>);
      continue;
    }
    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      out.push(
        <ul key={key++}>{items.map((it, j) => <li key={j}>{renderInline(it, j)}</li>)}</ul>,
      );
      continue;
    }
    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      out.push(
        <ol key={key++}>{items.map((it, j) => <li key={j}>{renderInline(it, j)}</li>)}</ol>,
      );
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    out.push(<p key={key++}>{renderInline(line, 0)}</p>);
    i++;
  }

  return <div className="md">{out}</div>;
}
