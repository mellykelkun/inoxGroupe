import type { ReactNode } from "react";
import { linkedParts } from "../../../packages/assistant-links";

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).flatMap((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return [<strong key={index}>{part.slice(2, -2)}</strong>];
    return linkedParts(part, true).map((piece, pieceIndex) => {
      if (!piece.href) return piece.text;
      const local = piece.href.startsWith("https://inox-admin.vercel.app/");
      return <a key={`${index}-${pieceIndex}`} href={local ? piece.href.slice("https://inox-admin.vercel.app".length) : piece.href} target={local ? undefined : "_blank"} rel="noopener noreferrer">{piece.text} ↗</a>;
    });
  });
}

function cells(line: string) {
  return line.replace(/^\s*\|\s*|\s*\|\s*$/g, "").split("|").map((cell) => cell.trim());
}

export default function AssistantText({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  for (let i = 0; i < lines.length;) {
    const line = lines[i].trim();
    if (!line) { i += 1; continue; }
    if (line.startsWith("|") && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1] || "") && (lines[i + 1] || "").includes("---")) {
      const headings = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(cells(lines[i++]));
      blocks.push(<div className="admin-assistant-table-wrap" key={blocks.length}><table><thead><tr>{headings.map((cell, index) => <th key={index}>{inline(cell)}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{inline(cell)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) { blocks.push(<h3 key={blocks.length}>{inline(heading[1])}</h3>); i += 1; continue; }
    if (/^(?:[-*]\s+|\d+\.\s+)/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^(?:[-*]\s+|\d+\.\s+)/.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^(?:[-*]\s+|\d+\.\s+)/, ""));
      blocks.push(<ul key={blocks.length}>{items.map((item, index) => <li key={index}>{inline(item)}</li>)}</ul>);
      continue;
    }
    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith("|") && !/^#{1,6}\s+/.test(lines[i].trim()) && !/^(?:[-*]\s+|\d+\.\s+)/.test(lines[i].trim())) paragraph.push(lines[i++].trim());
    if (!paragraph.length) { paragraph.push(lines[i++]); }
    blocks.push(<p key={blocks.length}>{inline(paragraph.join(" "))}</p>);
  }
  return <div className="admin-assistant-richtext">{blocks}</div>;
}
