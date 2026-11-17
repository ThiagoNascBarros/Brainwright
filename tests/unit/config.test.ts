import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { loadConfig } from '../../src/config.js';
import { makeProject } from '../helpers.js';

describe('FR-001: config', () => {
  it('FR-001: defaults the project root to cwd', async () => {
    const { project } = await makeProject();
    expect(loadConfig({}, project)).toEqual({ root: project, maxResponseChars: 20000 });
  });

  it('FR-001: resolves a relative BRAINWRIGHT_ROOT against cwd', async () => {
    const { project } = await makeProject();
    expect(loadConfig({ BRAINWRIGHT_ROOT: 'app' }, project).root).toBe(join(project, 'app'));
  });

  it('FR-001: reads maxResponseChars from brainwright.json and ignores unknown fields', async () => {
    const { project } = await makeProject({ 'brainwright.json': '{"maxResponseChars": 500, "x": 1}' });
    expect(loadConfig({}, project).maxResponseChars).toBe(500);
  });

  it('rejects an invalid config file with a clear message', async () => {
    const { project } = await makeProject({ 'brainwright.json': '{"maxResponseChars": -1}' });
    expect(() => loadConfig({}, project)).toThrow(/maxResponseChars/);
  });

  it('ignores the old .brainwright/config.json', async () => {
    const { project } = await makeProject({ '.brainwright/config.json': '{"maxResponseChars": 500}' });
    expect(loadConfig({}, project).maxResponseChars).toBe(20000);
  });
});
