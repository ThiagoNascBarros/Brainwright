/** Options of each graph command: CLI flag → tool argument and how its value is read (plan.md "CLI"). */
type Kind = 'string' | 'number' | 'flag';
interface Spec { tool: string; positional: string[]; options: Record<string, [arg: string, kind: Kind]> }

const FEATURE: [string, Kind] = ['feature', 'string'];
const LIMIT: [string, Kind] = ['limit', 'number'];
const COMMANDS: Record<string, Spec> = {
  query: { tool: 'query_graph', positional: ['question...'], options: { '--feature': FEATURE, '--mode': ['mode', 'string'], '--depth': ['depth', 'number'], '--budget': ['budget_tokens', 'number'], '--include-ambiguous': ['include_ambiguous', 'flag'] } },
  node: { tool: 'get_node', positional: ['ref'], options: { '--feature': FEATURE, '--relation': ['relation', 'string'], '--limit': LIMIT } },
  path: { tool: 'find_path', positional: ['from', 'to'], options: { '--feature': FEATURE, '--max-hops': ['max_hops', 'number'], '--include-ambiguous': ['include_ambiguous', 'flag'] } },
  report: { tool: 'graph_report', positional: [], options: { '--top': ['top', 'number'], '--community': ['community', 'number'], '--offset': ['offset', 'number'], '--limit': LIMIT } },
  lint: { tool: 'lint_memory', positional: [], options: { '--feature': FEATURE, '--limit': LIMIT } },
  export: { tool: 'export_graph', positional: ['format'], options: {} },
};

const USAGE = 'usage: brainwright-mcp graph <query <words…> | node <ref> | path <from> <to> | report | lint | export <json|report|obsidian>> [options]';

function parseOptions(
  argv: string[],
  spec: Spec,
): { args: Record<string, unknown>; positionals: string[] } | { usage: string } {
  const args: Record<string, unknown> = {};
  const positionals: string[] = [];
  for (let i = 1; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) { positionals.push(token); continue; }
    const option = spec.options[token];
    if (!option) return { usage: `${USAGE}\nunknown option ${token}` };
    const [name, kind] = option;
    if (kind === 'flag') { args[name] = true; continue; }
    const value = argv[++i];
    if (value === undefined) return { usage: `${USAGE}\n${token} needs a value` };
    args[name] = kind === 'number' ? Number(value) : value;
  }
  return { args, positionals };
}

function parsePositionals(
  cmd: string,
  spec: Spec,
  positionals: string[],
  args: Record<string, unknown>,
): { tool: string; args: Record<string, unknown> } | { usage: string } {
  const required = spec.positional.filter((p) => !p.endsWith('...')).length;
  if (positionals.length < required) return { usage: `${USAGE}\n${cmd} needs ${spec.positional.join(' ')}` };
  if (cmd === 'query') {
    if (positionals.length === 0) return { usage: `${USAGE}\nquery needs words` };
    args.question = positionals.join(' ');
  } else if (cmd === 'export') {
    args.format = positionals[0];
  } else {
    spec.positional.forEach((name, i) => { args[name] = positionals[i]; });
  }
  return { tool: spec.tool, args };
}

/** Parses the arguments after `graph`. Numbers are parsed here; the tool's zod schema validates them (plan.md "CLI"). */
export function parseGraphArgs(argv: string[]): { tool: string; args: Record<string, unknown> } | { usage: string } {
  const cmd = argv[0] ?? '';
  const spec = COMMANDS[cmd];
  if (!spec) return { usage: USAGE };
  const parsed = parseOptions(argv, spec);
  if ('usage' in parsed) return parsed;
  return parsePositionals(cmd, spec, parsed.positionals, parsed.args);
}
