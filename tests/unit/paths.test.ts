import { describe, it, expect } from 'vitest';
import { symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveInside, resolveWithin, ensureRoot } from '../../src/storage/paths.js';
import { makeProject } from '../helpers.js';

async function setup() {
  return makeProject({
    'specs-out-mcp/001-a/spec.md': 'x',
    'src/secret.ts': 'secret',
  });
}

describe('FR-001: path guard', () => {
  it('FR-001: allows paths under specs-out-mcp/', async () => {
    const { root } = await setup();
    expect(await resolveInside(root, 'specs-out-mcp/001-a/spec.md')).toBe(join(root, 'specs-out-mcp/001-a/spec.md'));
    expect(await resolveInside(root, 'specs-out-mcp/new/new.md')).toBe(join(root, 'specs-out-mcp/new/new.md'));
  });

  it.each(['src/secret.ts', 'README.md', '../x', 'specs-out-mcp/../src/secret.ts', '..\\x', 'specs-out-mcp\\..\\src\\secret.ts', '.hidden/x.md'])(
    'FR-001: refuses "%s"',
    async (rel) => {
      const { root } = await setup();
      await expect(resolveInside(root, rel)).rejects.toMatchObject({ code: 'PATH_OUTSIDE_ROOT' });
    },
  );

  it('FR-001: refuses absolute paths', async () => {
    const { root } = await setup();
    await expect(resolveInside(root, join(root, 'specs-out-mcp/001-a/spec.md'))).rejects.toMatchObject({ code: 'PATH_OUTSIDE_ROOT' });
  });

  it('FR-001: refuses a symlink inside specs-out-mcp/ that points elsewhere in the project', async () => {
    const { root } = await setup();
    await symlink(join(root, 'src/secret.ts'), join(root, 'specs-out-mcp/001-a/plan.md'));
    await expect(resolveInside(root, 'specs-out-mcp/001-a/plan.md')).rejects.toMatchObject({ code: 'PATH_OUTSIDE_ROOT' });
  });

  it('a missing root gives NOT_INITIALIZED', async () => {
    const { root } = await setup();
    await expect(ensureRoot(join(root, 'nope'))).rejects.toMatchObject({ code: 'NOT_INITIALIZED' });
  });
});

describe('FR-021: resolveWithin', () => {
  it('FR-021: allows a path under an extra prefix', async () => {
    const { root } = await makeProject({ 'docs/a.md': 'x' });
    expect(await resolveWithin(root, 'docs/a.md', ['docs'])).toBe(join(root, 'docs/a.md'));
  });

  it('FR-021: refuses traversal, absolute, backslash and escaping symlink paths with PATH_OUTSIDE_ROOT', async () => {
    const { root } = await makeProject({ 'docs/a.md': 'x', 'src/x.ts': 'x' });
    await symlink(join(root, '..'), join(root, 'docs/link'));
    for (const rel of ['docs/../src/x.ts', '/etc/x', '..\\x', 'docs/link/x.md']) {
      await expect(resolveWithin(root, rel, ['docs'])).rejects.toMatchObject({ code: 'PATH_OUTSIDE_ROOT' });
    }
  });
});
