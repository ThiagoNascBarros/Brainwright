import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export interface Config {
  /** Absolute path of the project root (BRAINWRIGHT_ROOT); specs-out-mcp/ lives below it. */
  root: string;
  maxResponseChars: number;
}

export const DEFAULT_MAX_RESPONSE_CHARS = 20000;
export const CONFIG_FILE = 'brainwright.json';

export function loadConfig(env: Record<string, string | undefined>, cwd: string): Config {
  const root = resolve(cwd, env.BRAINWRIGHT_ROOT || '.');
  const file = join(root, CONFIG_FILE);
  let maxResponseChars = DEFAULT_MAX_RESPONSE_CHARS;
  if (existsSync(file)) {
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(file, 'utf8'));
    } catch (error) {
      throw new Error(`Invalid ${file}: ${(error as Error).message}`);
    }
    const value = (raw as { maxResponseChars?: unknown } | null)?.maxResponseChars;
    if (value !== undefined) {
      if (!Number.isInteger(value) || (value as number) < 100) {
        throw new Error(`Invalid ${file}: maxResponseChars must be an integer >= 100`);
      }
      maxResponseChars = value as number;
    }
  }
  return { root, maxResponseChars };
}
