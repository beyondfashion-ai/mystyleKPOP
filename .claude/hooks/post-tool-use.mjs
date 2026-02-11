#!/usr/bin/env node
// OMC Post-Tool-Use Hook (Node.js)
// Processes <remember> tags from Task agent output
// Saves to .omc/notepad.md for compaction-resilient memory

import { existsSync, readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { readStdin } = await import(pathToFileURL(join(__dirname, 'lib', 'stdin.mjs')).href);
const { atomicWriteFileSync } = await import(pathToFileURL(join(__dirname, 'lib', 'atomic-write.mjs')).href);

const NOTEPAD_TEMPLATE = '# Notepad\n' +
  '<!-- Auto-managed by OMC. Manual edits preserved in MANUAL section. -->\n\n' +
  '## Priority Context\n' +
  '<!-- ALWAYS loaded. Keep under 500 chars. Critical discoveries only. -->\n\n' +
  '## Working Memory\n' +
  '<!-- Session notes. Auto-pruned after 7 days. -->\n\n' +
  '## MANUAL\n' +
  '<!-- User content. Never auto-pruned. -->\n';

function initNotepad(directory) {
  const omcDir = join(directory, '.omc');
  const notepadPath = join(omcDir, 'notepad.md');

  if (!existsSync(omcDir)) {
    try { mkdirSync(omcDir, { recursive: true }); } catch {}
  }

  if (!existsSync(notepadPath)) {
    try { atomicWriteFileSync(notepadPath, NOTEPAD_TEMPLATE); } catch {}
  }

  return notepadPath;
}

function setPriorityContext(notepadPath, content) {
  try {
    let notepad = readFileSync(notepadPath, 'utf-8');

    const priorityMatch = notepad.match(/## Priority Context[\s\S]*?(?=## Working Memory)/);
    if (priorityMatch) {
      const newPriority = '## Priority Context\n' +
        '<!-- ALWAYS loaded. Keep under 500 chars. Critical discoveries only. -->\n' +
        content.trim() + '\n\n';
      notepad = notepad.replace(priorityMatch[0], newPriority);
      atomicWriteFileSync(notepadPath, notepad);
    }
  } catch {}
}

function addWorkingMemoryEntry(notepadPath, content) {
  try {
    let notepad = readFileSync(notepadPath, 'utf-8');

    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const entry = '### ' + timestamp + '\n' + content.trim() + '\n\n';

    const manualIndex = notepad.indexOf('## MANUAL');
    if (manualIndex !== -1) {
      notepad = notepad.slice(0, manualIndex) + entry + notepad.slice(manualIndex);
      atomicWriteFileSync(notepadPath, notepad);
    }
  } catch {}
}

function processRememberTags(output, notepadPath) {
  if (!output) return;

  const priorityRegex = /<remember\s+priority>([\s\S]*?)<\/remember>/gi;
  let match;
  while ((match = priorityRegex.exec(output)) !== null) {
    const content = match[1].trim();
    if (content) {
      setPriorityContext(notepadPath, content);
    }
  }

  const regularRegex = /<remember>([\s\S]*?)<\/remember>/gi;
  while ((match = regularRegex.exec(output)) !== null) {
    const content = match[1].trim();
    if (content) {
      addWorkingMemoryEntry(notepadPath, content);
    }
  }
}

async function main() {
  try {
    const input = await readStdin();
    const data = JSON.parse(input);

    const toolName = data.tool_name || data.toolName || '';
    const rawResponse = data.tool_response || data.toolOutput || '';
    const toolOutput = typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse);
    const directory = data.cwd || data.directory || process.cwd();

    if (toolName !== 'Task' && toolName !== 'task' && toolName !== 'TaskCreate' && toolName !== 'TaskUpdate') {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    if (!toolOutput.includes('<remember')) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    const notepadPath = initNotepad(directory);
    processRememberTags(toolOutput, notepadPath);

    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  } catch (error) {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
