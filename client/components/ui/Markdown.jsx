export function Markdown({ content = "" }) {
  const html = toHtml(content);
  return (
    <div
      className="prose prose-invert max-w-none text-[color:var(--color-text-soft)] leading-relaxed prose-p:leading-relaxed prose-li:leading-relaxed prose-headings:leading-snug"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function toHtml(md) {
  let text = String(md || "");
  text = escapeHtml(text);
  // code blocks ```
  text = text.replace(/```([\s\S]*?)```/g, (_m, code) => `<pre><code>${code.trim()}</code></pre>`);
  // headings (support # to ######)
  text = text.replace(/^\s*######\s+(.+)$/gim, '<h6>$1</h6>');
  text = text.replace(/^\s*#####\s+(.+)$/gim, '<h5>$1</h5>');
  text = text.replace(/^\s*####\s+(.+)$/gim, '<h4>$1</h4>');
  text = text.replace(/^\s*###\s+(.+)$/gim, '<h3>$1</h3>');
  text = text.replace(/^\s*##\s+(.+)$/gim, '<h2>$1</h2>');
  text = text.replace(/^\s*#\s+(.+)$/gim, '<h1>$1</h1>');
  // horizontal rules with controlled spacing
  text = text.replace(/^\s*(?:[-*_]){3,}\s*$/gim, '<hr class="my-3 border-[color:var(--color-border)]/80" />');
  // bold and italics
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/_(.*?)_/g, '<em>$1</em>');
  // inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // unordered lists
  text = text.replace(/^(?:\s*[-*]\s+.*(?:\n|$))+?/gim, (block) => {
    const items = block
      .trim()
      .split(/\n/)
      .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
      .filter(Boolean)
      .map((li) => `<li>${li}</li>`) 
      .join("");
    return `<ul>${items}</ul>`;
  });
  // ordered lists (1. 2. 3.)
  text = text.replace(/^(?:\s*\d+\.\s+.*(?:\n|$))+?/gim, (block) => {
    const items = block
      .trim()
      .split(/\n/)
      .map((line) => line.replace(/^\s*\d+\.\s+/, "").trim())
      .filter(Boolean)
      .map((li) => `<li>${li}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });
  // paragraphs: build per-line to avoid headings inside paragraphs
  text = wrapParagraphs(text);
  return text;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function wrapParagraphs(str) {
  const lines = String(str || "").split(/\n/);
  const blocks = [];
  let buf = [];
  const isBlock = (l) => /^\s*<(h\d|ul|ol|pre|blockquote|hr|table|p|code)/i.test(l);
  const flush = () => {
    if (!buf.length) return;
    blocks.push(`<p>${buf.join('<br/>')}</p>`);
    buf = [];
  };
  for (const raw of lines) {
    const line = raw;
    if (!line.trim()) { flush(); continue; }
    if (isBlock(line)) { flush(); blocks.push(line); continue; }
    buf.push(line);
  }
  flush();
  return blocks.join("\n");
}
