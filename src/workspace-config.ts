/**
 * Workspace-level supervisor config — persists settings to .pi/supervisor-config.json.
 * Only written when the .pi/ directory already exists.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Sensitivity } from "./types.js";

const PI_DIR = ".pi";
const CONFIG_FILE = "supervisor-config.json";

const VALID_SENSITIVITIES: Sensitivity[] = ["low", "medium", "high"];

export interface WorkspaceConfig {
  provider: string;
  modelId: string;
  sensitivity?: Sensitivity;
}

/** Read config from <cwd>/.pi/supervisor-config.json. Returns null if absent or unreadable. */
export function loadWorkspaceConfig(cwd: string): WorkspaceConfig | null {
  const configPath = join(cwd, PI_DIR, CONFIG_FILE);
  if (!existsSync(configPath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(configPath, "utf-8"));
    if (typeof parsed.provider === "string" && typeof parsed.modelId === "string") {
      const config: WorkspaceConfig = { provider: parsed.provider, modelId: parsed.modelId };
      if (VALID_SENSITIVITIES.includes(parsed.sensitivity)) {
        config.sensitivity = parsed.sensitivity as Sensitivity;
      }
      return config;
    }
  } catch {}
  return null;
}

/**
 * Write config to <cwd>/.pi/supervisor-config.json.
 * Silently skips if the .pi/ directory does not exist.
 * Returns true when the file was written.
 */
export function saveWorkspaceConfig(
  cwd: string,
  provider: string,
  modelId: string,
  sensitivity?: Sensitivity,
): boolean {
  const piDir = join(cwd, PI_DIR);
  if (!existsSync(piDir)) return false;
  try {
    const data: WorkspaceConfig = { provider, modelId };
    if (sensitivity !== undefined) data.sensitivity = sensitivity;
    writeFileSync(
      join(piDir, CONFIG_FILE),
      JSON.stringify(data, null, 2) + "\n",
      "utf-8"
    );
    return true;
  } catch {
    return false;
  }
}
