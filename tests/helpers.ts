import { mkdtemp, mkdir, writeFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach } from 'vitest';

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()!();
});

/** Creates a temporary project with `files` (paths relative to the project root). `root` is the project root. */
export async function makeProject(files: Record<string, string> = {}) {
  const project = await realpath(await mkdtemp(join(tmpdir(), 'brainwright-')));
  cleanups.push(() => rm(project, { recursive: true, force: true }));
  for (const [path, content] of Object.entries(files)) {
    const full = join(project, path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, content);
  }
  return { project, root: project };
}
