import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GLOBALS_CSS = path.join(ROOT, "app", "globals.css");
const OUTPUT_MD = path.join(ROOT, "DESIGN_GUIDELINES.md");
const SCAN_DIRS = [path.join(ROOT, "app"), path.join(ROOT, "components")];

function extractBlock(content, startPattern) {
  const startIndex = content.search(startPattern);
  if (startIndex < 0) return "";
  const openBraceIndex = content.indexOf("{", startIndex);
  if (openBraceIndex < 0) return "";

  let depth = 0;
  for (let i = openBraceIndex; i < content.length; i += 1) {
    const ch = content[i];
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return content.slice(openBraceIndex + 1, i);
      }
    }
  }
  return "";
}

function parseCssVariables(block) {
  const vars = [];
  const regex = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match = regex.exec(block);
  while (match) {
    vars.push({ name: `--${match[1]}`, value: match[2].trim() });
    match = regex.exec(block);
  }
  return vars;
}

function parseTypography(content) {
  const layerBlock = extractBlock(content, /@layer\s+components/);
  if (!layerBlock) return { classes: [], darkOverrides: [] };

  const classes = [];
  const classRegex = /^\s*\.([a-z0-9-]+)\s*\{([\s\S]*?)^\s*\}/gim;
  let classMatch = classRegex.exec(layerBlock);

  while (classMatch) {
    const className = classMatch[1];
    if (className.startsWith("text-")) {
      const declarations = [];
      const declRegex = /([a-z-]+)\s*:\s*([^;]+);/gi;
      let declMatch = declRegex.exec(classMatch[2]);
      while (declMatch) {
        declarations.push({ prop: declMatch[1], value: declMatch[2].trim() });
        declMatch = declRegex.exec(classMatch[2]);
      }
      classes.push({ className, declarations });
    }
    classMatch = classRegex.exec(layerBlock);
  }

  const darkOverrides = [];
  const darkRegex = /^\s*\[data-theme="dark"\]\s+\.([a-z0-9-]+)\s*\{([\s\S]*?)^\s*\}/gim;
  let darkMatch = darkRegex.exec(layerBlock);
  while (darkMatch) {
    const className = darkMatch[1];
    const declarations = [];
    const declRegex = /([a-z-]+)\s*:\s*([^;]+);/gi;
    let declMatch = declRegex.exec(darkMatch[2]);
    while (declMatch) {
      declarations.push({ prop: declMatch[1], value: declMatch[2].trim() });
      declMatch = declRegex.exec(darkMatch[2]);
    }
    darkOverrides.push({ className, declarations });
    darkMatch = darkRegex.exec(layerBlock);
  }

  return { classes, darkOverrides };
}

function spacingSortValue(token) {
  const match = token.match(/-(\d+(?:\.\d+)?)$/);
  if (match) return Number(match[1]);
  if (token.endsWith("-px")) return 0.001;
  return Number.POSITIVE_INFINITY;
}

function bySpacingToken(a, b) {
  const [prefixA] = a.split("-");
  const [prefixB] = b.split("-");
  if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);
  return spacingSortValue(a) - spacingSortValue(b) || a.localeCompare(b);
}

async function walkFiles(startDir) {
  const entries = await fs.readdir(startDir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile() && /\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function parseSpacingUtilities() {
  const spacingRegex =
    /\b(?:m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl|gap|space-x|space-y)-(?:\d+(?:\.\d+)?|px|\[[^\]]+\])\b/g;
  const counters = new Map();

  for (const dir of SCAN_DIRS) {
    const files = await walkFiles(dir);
    for (const filePath of files) {
      const source = await fs.readFile(filePath, "utf8");
      const matches = source.match(spacingRegex) ?? [];
      for (const token of matches) {
        counters.set(token, (counters.get(token) ?? 0) + 1);
      }
    }
  }

  return [...counters.entries()]
    .sort((a, b) => bySpacingToken(a[0], b[0]))
    .map(([token, count]) => ({ token, count }));
}

function makeSection(title, rows) {
  const lines = [`### ${title}`];
  for (const row of rows) {
    lines.push(`- \`${row.name}\`: \`${row.value}\``);
  }
  lines.push("");
  return lines.join("\n");
}

function buildMarkdown({
  lightScale,
  darkScale,
  lightSemantic,
  darkSemantic,
  typography,
  spacing,
}) {
  const now = new Date().toISOString();
  const lines = [];

  lines.push("# Frontend Design Guidelines (Auto-Generated)");
  lines.push("");
  lines.push(
    "> This file is generated from `app/globals.css` and class usage in `app/` + `components/`. Do not edit manually.",
  );
  lines.push("");
  lines.push(`- Generated at: \`${now}\``);
  lines.push("- Regenerate: `npm run design:guidelines`");
  lines.push("");
  lines.push("## Purpose");
  lines.push("");
  lines.push(
    "- Use this as the source-of-truth context when prompting AI coding agents to implement or refactor UI in this repo.",
  );
  lines.push("- Keep all new UI token-driven. Avoid hardcoded colors, typography, and spacing.");
  lines.push("");
  lines.push("## AI Agent Hand-off Prompt");
  lines.push("");
  lines.push(
    "- Add this instruction in your prompt: `Follow DESIGN_GUIDELINES.md exactly. Use existing tokens and text classes. Do not introduce raw hex colors or non-standard spacing utilities unless requested.`",
  );
  lines.push("");
  lines.push("## Colors");
  lines.push("");
  lines.push(makeSection("Light Mode: Base Scales", lightScale));
  lines.push(makeSection("Dark Mode: Base Scales", darkScale));
  lines.push(makeSection("Light Mode: Semantic Tokens", lightSemantic));
  lines.push(makeSection("Dark Mode: Semantic Tokens", darkSemantic));
  lines.push("## Typography");
  lines.push("");
  for (const entry of typography.classes) {
    lines.push(`### \`${entry.className}\``);
    for (const decl of entry.declarations) {
      lines.push(`- \`${decl.prop}\`: \`${decl.value}\``);
    }
    const override = typography.darkOverrides.find((o) => o.className === entry.className);
    if (override) {
      lines.push("- Dark override:");
      for (const decl of override.declarations) {
        lines.push(`  - \`${decl.prop}\`: \`${decl.value}\``);
      }
    }
    lines.push("");
  }
  lines.push("## Spacing");
  lines.push("");
  lines.push(
    "- The list below is extracted from existing class usage and represents the current spacing vocabulary for this codebase.",
  );
  lines.push("- Prefer these utilities first before introducing new spacing values.");
  lines.push("");
  for (const { token, count } of spacing) {
    lines.push(`- \`${token}\` (used ${count}x)`);
  }
  lines.push("");
  lines.push("## Implementation Rules For Frontend Contributors");
  lines.push("");
  lines.push("- Always style with CSS variables or existing semantic utility classes.");
  lines.push("- Keep mode support automatic via tokens under `:root` and `[data-theme=\"dark\"]`.");
  lines.push("- If tokens change, regenerate this guide before opening a PR.");
  lines.push("");

  return `${lines.join("\n").trimEnd()}\n`;
}

async function main() {
  const css = await fs.readFile(GLOBALS_CSS, "utf8");
  const rootBlock = extractBlock(css, /:root/);
  const darkBlock = extractBlock(css, /\[data-theme="dark"\]/);

  const lightVars = parseCssVariables(rootBlock);
  const darkVars = parseCssVariables(darkBlock);

  const isScaleVar = (name) => /^--(?:violet|neutral)-/.test(name);
  const isSemanticVar = (name) => !isScaleVar(name);

  const typography = parseTypography(css);
  const spacing = await parseSpacingUtilities();

  const markdown = buildMarkdown({
    lightScale: lightVars.filter((v) => isScaleVar(v.name)),
    darkScale: darkVars.filter((v) => isScaleVar(v.name)),
    lightSemantic: lightVars.filter((v) => isSemanticVar(v.name)),
    darkSemantic: darkVars.filter((v) => isSemanticVar(v.name)),
    typography,
    spacing,
  });

  await fs.writeFile(OUTPUT_MD, markdown, "utf8");
  // eslint-disable-next-line no-console
  console.log(`Generated ${path.relative(ROOT, OUTPUT_MD)}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
