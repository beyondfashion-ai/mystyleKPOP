#!/usr/bin/env node

/**
 * OMC Keyword Detector Hook (Node.js)
 * Detects magic keywords and invokes skill tools
 * Adapted for mystyleKPOP project
 *
 * Supported keywords:
 * 1. ralph: Persistence mode until task completion
 * 2. autopilot: Full autonomous execution
 * 3. ultrawork/ulw: Maximum parallel execution
 * 4. ecomode/eco: Token-efficient execution
 * 5. plan: Planning interview mode
 * 6. ultrathink/think: Extended reasoning
 */

import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { readStdin } = await import(pathToFileURL(join(__dirname, 'lib', 'stdin.mjs')).href);

const ULTRATHINK_MESSAGE = `<think-mode>

**ULTRATHINK MODE ENABLED** - Extended reasoning activated.

You are now in deep thinking mode. Take your time to:
1. Thoroughly analyze the problem from multiple angles
2. Consider edge cases and potential issues
3. Think through the implications of each approach
4. Reason step-by-step before acting

Use your extended thinking capabilities to provide the most thorough and well-reasoned response.

</think-mode>

---
`;

function extractPrompt(input) {
  try {
    const data = JSON.parse(input);
    if (data.prompt) return data.prompt;
    if (data.message?.content) return data.message.content;
    if (Array.isArray(data.parts)) {
      return data.parts
        .filter(p => p.type === 'text')
        .map(p => p.text)
        .join(' ');
    }
    return '';
  } catch {
    const match = input.match(/"(?:prompt|content|text)"\s*:\s*"([^"]+)"/);
    return match ? match[1] : '';
  }
}

function sanitizeForKeywordDetection(text) {
  return text
    .replace(/<(\w[\w-]*)[\s>][\s\S]*?<\/\1>/g, '')
    .replace(/<\w[\w-]*(?:\s[^>]*)?\s*\/>/g, '')
    .replace(/https?:\/\/[^\s)>\]]+/g, '')
    .replace(/(?<=^|[\s"'`(])(?:\/)?(?:[\w.-]+\/)+[\w.-]+/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '');
}

function activateState(directory, prompt, stateName, sessionId) {
  const state = {
    active: true,
    started_at: new Date().toISOString(),
    original_prompt: prompt,
    session_id: sessionId || undefined,
    reinforcement_count: 0,
    last_checked_at: new Date().toISOString()
  };

  const localDir = join(directory, '.omc', 'state');
  if (!existsSync(localDir)) {
    try { mkdirSync(localDir, { recursive: true }); } catch {}
  }
  try { writeFileSync(join(localDir, `${stateName}-state.json`), JSON.stringify(state, null, 2)); } catch {}
}

function clearStateFiles(directory, modeNames) {
  for (const name of modeNames) {
    const localPath = join(directory, '.omc', 'state', `${name}-state.json`);
    try { if (existsSync(localPath)) unlinkSync(localPath); } catch {}
  }
}

function createModeActivation(modeName, originalPrompt) {
  return `[MODE ACTIVATED: ${modeName.toUpperCase()}]

${modeName} mode is now active. Continue working on the user's request with ${modeName} behavior enabled.

User request:
${originalPrompt}`;
}

function createHookOutput(additionalContext) {
  return {
    continue: true,
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext
    }
  };
}

async function main() {
  try {
    const input = await readStdin();
    if (!input.trim()) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    let data = {};
    try { data = JSON.parse(input); } catch {}
    const directory = data.cwd || data.directory || process.cwd();

    const prompt = extractPrompt(input);
    if (!prompt) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    const cleanPrompt = sanitizeForKeywordDetection(prompt).toLowerCase();
    const matches = [];

    // Cancel keywords
    if (/\b(cancelomc|stopomc)\b/i.test(cleanPrompt)) {
      matches.push({ name: 'cancel', args: '' });
    }

    // Ralph keywords
    if (/\b(ralph|don't stop|must complete|until done)\b/i.test(cleanPrompt)) {
      matches.push({ name: 'ralph', args: '' });
    }

    // Autopilot keywords
    if (/\b(autopilot|auto pilot|auto-pilot|autonomous|full auto|fullsend)\b/i.test(cleanPrompt) ||
        /\bbuild\s+me\s+/i.test(cleanPrompt) ||
        /\bcreate\s+me\s+/i.test(cleanPrompt) ||
        /\bmake\s+me\s+/i.test(cleanPrompt) ||
        /\bhandle\s+it\s+all\b/i.test(cleanPrompt) ||
        /\bend\s+to\s+end\b/i.test(cleanPrompt)) {
      matches.push({ name: 'autopilot', args: '' });
    }

    // Ultrawork keywords
    if (/\b(ultrawork|ulw|uw)\b/i.test(cleanPrompt)) {
      matches.push({ name: 'ultrawork', args: '' });
    }

    // Ecomode keywords
    if (/\b(eco|ecomode|eco-mode|budget)\b/i.test(cleanPrompt)) {
      matches.push({ name: 'ecomode', args: '' });
    }

    // Plan keywords
    if (/\b(plan this|plan the)\b/i.test(cleanPrompt)) {
      matches.push({ name: 'plan', args: '' });
    }

    // Ultrathink keywords
    if (/\b(ultrathink|think hard|think deeply)\b/i.test(cleanPrompt)) {
      matches.push({ name: 'ultrathink', args: '' });
    }

    if (matches.length === 0) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    // Handle cancel
    if (matches.some(m => m.name === 'cancel')) {
      clearStateFiles(directory, ['ralph', 'autopilot', 'ultrawork', 'ecomode']);
      console.log(JSON.stringify(createHookOutput('[ALL MODES CANCELLED] State files cleared. Returning to normal operation.')));
      return;
    }

    // Activate states
    const sessionId = data.sessionId || data.session_id || data.sessionid || '';
    const stateModes = matches.filter(m => ['ralph', 'autopilot', 'ultrawork', 'ecomode'].includes(m.name));
    for (const mode of stateModes) {
      activateState(directory, prompt, mode.name, sessionId);
    }

    // Ralph includes ultrawork
    const hasRalph = matches.some(m => m.name === 'ralph');
    const hasEcomode = matches.some(m => m.name === 'ecomode');
    const hasUltrawork = matches.some(m => m.name === 'ultrawork');
    if (hasRalph && !hasEcomode && !hasUltrawork) {
      activateState(directory, prompt, 'ultrawork', sessionId);
    }

    // Handle ultrathink
    const ultrathinkIndex = matches.findIndex(m => m.name === 'ultrathink');
    if (ultrathinkIndex !== -1) {
      matches.splice(ultrathinkIndex, 1);
      if (matches.length === 0) {
        console.log(JSON.stringify(createHookOutput(ULTRATHINK_MESSAGE)));
        return;
      }
      const modeMessages = matches.map(m => createModeActivation(m.name, prompt)).join('\n\n---\n\n');
      console.log(JSON.stringify(createHookOutput(ULTRATHINK_MESSAGE + modeMessages)));
      return;
    }

    // Emit mode activations
    const modeMessages = matches.map(m => createModeActivation(m.name, prompt)).join('\n\n---\n\n');
    console.log(JSON.stringify(createHookOutput(modeMessages)));
  } catch (error) {
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  }
}

main();
