import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const testsDir = fileURLToPath(new URL('../', import.meta.url));
const entry = fileURLToPath(new URL('../../dist/index.js', import.meta.url));
const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

let client: Client | undefined;
afterEach(async () => {
  await client?.close();
  client = undefined;
});

async function connect() {
  // cwd outside the root: proves the server does not depend on the working directory
  const transport = new StdioClientTransport({ command: process.execPath, args: [entry], cwd: testsDir });
  client = new Client({ name: 'contract-test', version: '0.0.0' });
  await client.connect(transport);
  return { client, transport };
}

describe('stdio contract', () => {
  it('reports serverInfo name "brainwright" and package.json version', async () => {
    const { client } = await connect();
    expect(client.getServerVersion()).toMatchObject({ name: 'brainwright', version: pkg.version });
  });

  it('answers tools/list with an empty list (no tools in the skeleton)', async () => {
    const { client } = await connect();
    const { tools } = await client.listTools();
    expect(tools).toEqual([]);
  });

  it('exits after the client closes stdin', async () => {
    const { client, transport } = await connect();
    const pid = transport.pid!;
    await client.close();
    await new Promise((r) => setTimeout(r, 2000));
    expect(() => process.kill(pid, 0)).toThrow();
  });
});
