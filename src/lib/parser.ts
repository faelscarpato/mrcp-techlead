import mri from 'mri';

export interface ParsedCommand {
  base: string; // usually 'mrcp' or empty
  action: string; // e.g., 'clone', 'analyze', 'health'
  args: string[]; // positional arguments (e.g., URL)
  flags: Record<string, unknown>; // parsed flags (e.g., --stream, --json)
  raw: string;
}

export function parseCommand(rawCommand: string): ParsedCommand {
  const trimmed = rawCommand.trim();
  
  if (!trimmed) {
    return { base: '', action: '', args: [], flags: {}, raw: rawCommand };
  }
  
  // Use a basic regex to split by space, respecting quotes if we want (simple split for now)
  // For a robust CLI, we'd use a regex that handles quotes.
  const parts = trimmed.match(/(?:[^\s"']+|['"][^'"]*["'])+/g) || [];
  
  // Clean quotes from parts
  const cleanParts = parts.map(p => p.replace(/^["'](.*)["']$/, '$1'));
  
  const parsed = mri(cleanParts);
  const _ = parsed._ || [];
  
  // We assume structure: mrcp <action> <args...> --flags
  const base = _[0] || '';
  const action = _[1] || '';
  const args = _.slice(2);
  
  // Remove '_' from the parsed object to get just flags
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _: _unused, ...flags } = parsed;
  
  return {
    base,
    action,
    args,
    flags,
    raw: rawCommand
  };
}
