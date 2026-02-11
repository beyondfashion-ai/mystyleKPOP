#!/usr/bin/env node

/**
 * OMC Persistent Mode Hook (Node.js)
 * Minimal continuation enforcer for OMC modes.
 * Adapted for mystyleKPOP project
 *
 * Supported modes: ralph, autopilot, ultrawork, ecomode
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  unlinkSync,
} from "fs";
import { join, dirname, resolve, normalize } from "path";
import { homedir } from "os";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { readStdin } = await import(
  pathToFileURL(join(__dirname, "lib", "stdin.mjs")).href
);

function readJsonFile(path) {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}

function writeJsonFile(path, data) {
  try {
    const dir = dirname(path);
    if (dir && dir !== "." && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(path, JSON.stringify(data, null, 2));
    return true;
  } catch {
    return false;
  }
}

const STALE_STATE_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

function isStaleState(state) {
  if (!state) return true;
  const lastChecked = state.last_checked_at ? new Date(state.last_checked_at).getTime() : 0;
  const startedAt = state.started_at ? new Date(state.started_at).getTime() : 0;
  const mostRecent = Math.max(lastChecked, startedAt);
  if (mostRecent === 0) return true;
  const age = Date.now() - mostRecent;
  return age > STALE_STATE_THRESHOLD_MS;
}

function isContextLimitStop(data) {
  const reason = (data.stop_reason || data.stopReason || "").toLowerCase();
  const contextPatterns = [
    "context_limit", "context_window", "context_exceeded",
    "context_full", "max_context", "token_limit",
    "max_tokens", "conversation_too_long", "input_too_long",
  ];
  if (contextPatterns.some((p) => reason.includes(p))) return true;
  const endTurnReason = (data.end_turn_reason || data.endTurnReason || "").toLowerCase();
  if (endTurnReason && contextPatterns.some((p) => endTurnReason.includes(p))) return true;
  return false;
}

function isUserAbort(data) {
  if (data.user_requested || data.userRequested) return true;
  const reason = (data.stop_reason || data.stopReason || "").toLowerCase();
  const exactPatterns = ["aborted", "abort", "cancel", "interrupt"];
  const substringPatterns = ["user_cancel", "user_interrupt", "ctrl_c", "manual_stop"];
  return exactPatterns.some((p) => reason === p) || substringPatterns.some((p) => reason.includes(p));
}

function countIncompleteTodos(projectDir) {
  let count = 0;
  for (const path of [
    join(projectDir, ".omc", "todos.json"),
    join(projectDir, ".claude", "todos.json"),
  ]) {
    try {
      const data = readJsonFile(path);
      const todos = Array.isArray(data) ? data : Array.isArray(data?.todos) ? data.todos : [];
      count += todos.filter((t) => t.status !== "completed" && t.status !== "cancelled").length;
    } catch {}
  }
  return count;
}

async function main() {
  try {
    const input = await readStdin();
    let data = {};
    try { data = JSON.parse(input); } catch {
      process.stdout.write(JSON.stringify({ continue: true, suppressOutput: true }) + "\n");
      return;
    }

    const directory = data.cwd || data.directory || process.cwd();
    const sessionId = data.sessionId || data.session_id || data.sessionid || "";
    const stateDir = join(directory, ".omc", "state");

    if (isContextLimitStop(data)) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    if (isUserAbort(data)) {
      console.log(JSON.stringify({ continue: true, suppressOutput: true }));
      return;
    }

    const totalIncomplete = countIncompleteTodos(directory);

    // Check modes in priority order
    const modes = ['ralph', 'autopilot', 'ultrawork', 'ecomode'];
    for (const modeName of modes) {
      const statePath = join(stateDir, `${modeName}-state.json`);
      const state = readJsonFile(statePath);

      if (state?.active && !isStaleState(state)) {
        const sessionMatches = !state.session_id || state.session_id === sessionId;
        if (sessionMatches) {
          const newCount = (state.reinforcement_count || 0) + 1;
          const maxReinforcements = state.max_reinforcements || 50;

          if (newCount > maxReinforcements) {
            console.log(JSON.stringify({ continue: true, suppressOutput: true }));
            return;
          }

          state.reinforcement_count = newCount;
          state.last_checked_at = new Date().toISOString();
          writeJsonFile(statePath, state);

          let reason = `[${modeName.toUpperCase()} #${newCount}/${maxReinforcements}] Mode active.`;

          if (totalIncomplete > 0) {
            reason += ` ${totalIncomplete} incomplete todos remain. Continue working.`;
          } else if (newCount >= 3) {
            reason += ` If all work is complete, type "stopomc" to exit. Otherwise, continue working.`;
          } else {
            reason += ` Continue working.`;
          }

          if (state.original_prompt) {
            reason += `\nTask: ${state.original_prompt}`;
          }

          console.log(JSON.stringify({ decision: "block", reason }));
          return;
        }
      }
    }

    // No blocking needed
    console.log(JSON.stringify({ continue: true, suppressOutput: true }));
  } catch (error) {
    try {
      process.stdout.write(JSON.stringify({ continue: true, suppressOutput: true }) + "\n");
    } catch {
      process.exit(0);
    }
  }
}

// Global error handlers
process.on("uncaughtException", () => {
  try { process.stdout.write(JSON.stringify({ continue: true, suppressOutput: true }) + "\n"); } catch {}
  process.exit(0);
});

process.on("unhandledRejection", () => {
  try { process.stdout.write(JSON.stringify({ continue: true, suppressOutput: true }) + "\n"); } catch {}
  process.exit(0);
});

const safetyTimeout = setTimeout(() => {
  try { process.stdout.write(JSON.stringify({ continue: true, suppressOutput: true }) + "\n"); } catch {}
  process.exit(0);
}, 10000);

main().finally(() => {
  clearTimeout(safetyTimeout);
});
