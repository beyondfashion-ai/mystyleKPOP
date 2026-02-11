#!/usr/bin/env node
/**
 * OMC Pre-Tool-Use Hook (Node.js)
 * Enforces delegation by warning when orchestrator attempts direct source file edits
 * Adapted for mystyleKPOP project
 */

import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { readStdin } = await import(pathToFileURL(path.join(__dirname, 'lib', 'stdin.mjs')).href);

const ALLOWED_PATH_PATTERNS = [
  /^\.omc\//,
  /^\.claude\//,
  /\/\.claude\//,
  /CLAUDE\.md$/,
  /AGENTS\.md$/,
];

const SOURCE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.pyw',
  '.go', '.rs', '.java', '.kt', '.scala',
  '.c', '.cpp', '.cc', '.h', '.hpp',
  '.rb', '.php',
  '.svelte', '.vue',
  '.graphql', '.gql',
  '.sh', '.bash', '.zsh',
]);

function isAllowedPath(filePath) {
  if (!filePath) return true;
  const clean = path.normalize(filePath.replace(/\\/g, '/')).replace(/\\/g, '/');
  if (clean.startsWith('../') || clean === '..') return false;
  return ALLOWED_PATH_PATTERNS.some(pattern => pattern.test(clean));
}

function isSourceFile(filePath) {
  if (!filePath) return false;
  const ext = path.extname(filePath).toLowerCase();
  return SOURCE_EXTENSIONS.has(ext);
}

const FILE_MODIFY_PATTERNS = [
  /sed\s+-i/,
  />\s*[^&]/,
  />>/,
  /tee\s+/,
  /cat\s+.*>\s*/,
  /echo\s+.*>\s*/,
  /printf\s+.*>\s*/,
];

const SOURCE_EXT_PATTERN = /\.(ts|tsx|js|jsx|mjs|cjs|py|pyw|go|rs|java|kt|scala|c|cpp|cc|h|hpp|rb|php|svelte|vue|graphql|gql|sh|bash|zsh)/i;

function checkBashCommand(command) {
  const mayModify = FILE_MODIFY_PATTERNS.some(pattern => pattern.test(command));
  if (!mayModify) return null;

  if (SOURCE_EXT_PATTERN.test(command)) {
    return `[DELEGATION NOTICE] Bash command may modify source files: ${command}

Recommended: Delegate to executor agent instead:
  Task(subagent_type="general-purpose", model="sonnet", prompt="...")

This is a soft warning. Operation will proceed.`;
  }
  return null;
}

async function main() {
  const input = await readStdin();

  let data;
  try {
    data = JSON.parse(input);
  } catch {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
    return;
  }

  const toolName = data.tool_name || data.toolName || '';

  if (toolName === 'Bash' || toolName === 'bash') {
    const toolInput = data.tool_input || data.toolInput || {};
    const command = toolInput.command || '';
    const warning = checkBashCommand(command);
    if (warning) {
      console.log(JSON.stringify({
        continue: true,
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext: warning
        }
      }));
    } else {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
    }
    return;
  }

  if (!['Edit', 'Write', 'edit', 'write'].includes(toolName)) {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
    return;
  }

  const toolInput = data.tool_input || data.toolInput || {};
  const filePath = toolInput.file_path || toolInput.filePath || '';

  if (!filePath) {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
    return;
  }

  if (isAllowedPath(filePath)) {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
    return;
  }

  if (isSourceFile(filePath)) {
    const warning = `[DELEGATION NOTICE] Direct ${toolName} on source file: ${filePath}

Recommended: Delegate to executor agent instead:
  Task(subagent_type="general-purpose", model="sonnet", prompt="...")

This is a soft warning. Operation will proceed.`;

    console.log(JSON.stringify({
      continue: true,
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: warning
      }
    }));
    return;
  }

  console.log(JSON.stringify({ continue: true, suppressOutput: true }));
}

main().catch(() => {
  console.log(JSON.stringify({ continue: true, suppressOutput: true }));
});
