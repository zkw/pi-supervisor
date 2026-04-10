/**
 * Global supervisor config — persists settings to ~/.pi/agent/supervisor.json.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Sensitivity } from "./types.js";

const CONFIG_DIR = join(homedir(), ".pi", "agent");
const CONFIG_PATH = join(CONFIG_DIR, "supervisor.json");

const VALID_SENSITIVITIES: Sensitivity[] = ["low", "medium", "high"];

export interface SupervisorConfig {
  provider: string;
  modelId: string;
  sensitivity?: Sensitivity;
}

/** Read config from ~/.pi/agent/supervisor.json. Returns null if absent or unreadable. */
export function loadSupervisorConfig(): SupervisorConfig | null {
  if (!existsSync(CONFIG_PATH)) return null;
  try {
    const parsed = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    if (typeof parsed.provider === "string" && typeof parsed.modelId === "string") {
      const config: SupervisorConfig = { provider: parsed.provider, modelId: parsed.modelId };
      if (VALID_SENSITIVITIES.includes(parsed.sensitivity)) {
        config.sensitivity = parsed.sensitivity as Sensitivity;
      }
      return config;
    }
  } catch {}
  return null;
}

/**
 * Write config to ~/.pi/agent/supervisor.json.
 * Returns true when the file was written.
 */
export function saveSupervisorConfig(
  provider: string,
  modelId: string,
  sensitivity?: Sensitivity,
): boolean {
  try {
    mkdirSync(CONFIG_DIR, { recursive: true });
    const data: SupervisorConfig = { provider, modelId };
    if (sensitivity !== undefined) data.sensitivity = sensitivity;
    writeFileSync(
      CONFIG_PATH,
      JSON.stringify(data, null, 2) + "\n",
      "utf-8"
    );
    return true;
  } catch {
    return false;
  }
}
