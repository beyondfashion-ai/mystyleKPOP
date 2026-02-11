#!/usr/bin/env node
// OMC Session Start Hook (Node.js)
// Restores persistent mode states when session starts
// Adapted for mystyleKPOP project

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let readStdin;
try {
  const mod = await import(pathToFileURL(join(__dirname, 'lib', 'stdin.mjs')).href);
  readStdin = mod.readStdin;
} catch {
  readStdin = (timeoutMs = 5000) => new Promise((resolve) => {
    const chunks = [];
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) { settled = true; process.stdin.removeAllListeners(); process.stdin.destroy(); resolve(Buffer.concat(chunks).toString('utf-8')); }
    }, timeoutMs);
    process.stdin.on('data', (chunk) => { chunks.push(chunk); });
    process.stdin.on('end', () => { if (!settled) { settled = true; clearTimeout(timeout); resolve(Buffer.concat(chunks).toString('utf-8')); } });
    process.stdin.on('error', () => { if (!settled) { settled = true; clearTimeout(timeout); resolve(''); } });
    if (process.stdin.readableEnded) { if (!settled) { settled = true; clearTimeout(timeout); resolve(Buffer.concat(chunks).toString('utf-8')); } }
  });
}

function readJsonFile(path) {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

const NOTEPAD_FILENAME = 'notepad.md';
const PRIORITY_HEADER = '## Priority Context';

function readNotepad(directory) {
  const notepadPath = join(directory, '.omc', NOTEPAD_FILENAME);
  if (!existsSync(notepadPath)) return null;
  try {
    return readFileSync(notepadPath, 'utf-8');
  } catch {
    return null;
  }
}

function extractSection(content, header) {
  const regex = new RegExp(`${header}\\n([\\s\\S]*?)(?=\\n## [^#]|$)`);
  const match = content.match(regex);
  if (!match) return null;
  let section = match[1];
  section = section.replace(/<!--[\s\S]*?-->/g, '').trim();
  return section || null;
}

function getPriorityContext(directory) {
  const content = readNotepad(directory);
  if (!content) return null;
  return extractSection(content, PRIORITY_HEADER);
}

async function main() {
  try {
    const input = await readStdin();
    let data = {};
    try { data = JSON.parse(input); } catch {}

    const directory = data.cwd || data.directory || process.cwd();
    const sessionId = data.sessionId || data.session_id || data.sessionid || '';
    const messages = [];

    // Check for ultrawork state
    const ultraworkState = readJsonFile(join(directory, '.omc', 'state', 'ultrawork-state.json'));

    if (ultraworkState?.active && (!ultraworkState.session_id || ultraworkState.session_id === sessionId)) {
      messages.push(`<session-restore>

[ULTRAWORK MODE RESTORED]

You have an active ultrawork session from ${ultraworkState.started_at}.
Original task: ${ultraworkState.original_prompt}

Continue working in ultrawork mode until all tasks are complete.

</session-restore>

---
`);
    }

    // Check for incomplete todos
    const localTodoPaths = [
      join(directory, '.omc', 'todos.json'),
      join(directory, '.claude', 'todos.json')
    ];
    let incompleteCount = 0;
    for (const todoFile of localTodoPaths) {
      if (existsSync(todoFile)) {
        try {
          const data = readJsonFile(todoFile);
          const todos = data?.todos || (Array.isArray(data) ? data : []);
          incompleteCount += todos.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length;
        } catch {}
      }
    }

    if (incompleteCount > 0) {
      messages.push(`<session-restore>

[PENDING TASKS DETECTED]

You have ${incompleteCount} incomplete tasks from a previous session.
Please continue working on these tasks.

</session-restore>

---
`);
    }

    // Check for notepad Priority Context
    const priorityContext = getPriorityContext(directory);
    if (priorityContext) {
      messages.push(`<session-restore>

[NOTEPAD PRIORITY CONTEXT LOADED]

<notepad-priority>

## Priority Context

${priorityContext}

</notepad-priority>

</session-restore>

---
`);
    }

    if (messages.length > 0) {
      console.log(JSON.stringify({
        continue: true,
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext: messages.join('\n')
        }
      }));
    } else {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
    }
  } catch (error) {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
