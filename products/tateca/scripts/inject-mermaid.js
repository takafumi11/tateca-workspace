#!/usr/bin/env node
/**
 * inject-mermaid.js
 *
 * Post-processes Redoc-generated HTML to enable Mermaid diagram rendering.
 * Converts <pre><code class="language-mermaid">...</code></pre> blocks into
 * <div class="mermaid">...</div> blocks and injects the Mermaid CDN script.
 */

const fs = require('fs');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node inject-mermaid.js <html-file>');
  process.exit(1);
}

let html = fs.readFileSync(filePath, 'utf8');

// Convert mermaid code blocks to mermaid divs
html = html.replace(
  /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
  (_, content) => {
    const decoded = content
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return `<div class="mermaid">${decoded}</div>`;
  }
);

// Inject Mermaid CDN script before </body>
const mermaidScript = `
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true, theme: 'default' });
</script>
`;
html = html.replace('</body>', `${mermaidScript}</body>`);

fs.writeFileSync(filePath, html, 'utf8');
console.log(`Mermaid injection complete: ${filePath}`);
