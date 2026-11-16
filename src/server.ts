import { readFileSync } from 'node:fs';
import { McpServer } from '@modelcontextprotocol/server';
import type { Config } from './config.js';
import { defaultDeps, type Deps } from './deps.js';

// Relative to this module, not cwd: the client may launch us from anywhere.
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };

/** Builds the MCP server. The skeleton registers no tools yet; config and deps are kept for the modules to come. */
export function createServer(_config: Config, _deps: Deps = defaultDeps): McpServer {
  return new McpServer({ name: 'brainwright', version });
}
