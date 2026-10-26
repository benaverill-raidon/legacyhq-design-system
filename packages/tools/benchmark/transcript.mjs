// Reads one `claude -p --output-format stream-json --verbose` transcript (one JSON event per line)
// into what the benchmark records: the final answer, every tool call in order, and the run's cost.

/**
 * @param {string} jsonl the transcript
 * @returns {{ model, tools: string[], mcpServers: object[], answer, toolCalls: {name, input, isError}[], turns, durationMs, costUsd, usage, isError, subtype }}
 */
export function readTranscript(jsonl) {
  const events = jsonl.split('\n').filter((line) => line.trim()).map((line) => JSON.parse(line));
  const init = events.find((e) => e.type === 'system' && e.subtype === 'init') ?? {};
  const result = events.findLast((e) => e.type === 'result') ?? {};

  const toolCalls = [];
  const byId = new Map();
  for (const event of events) {
    for (const block of event.message?.content ?? []) {
      if (event.type === 'assistant' && block.type === 'tool_use') {
        const call = { name: block.name, input: block.input, isError: false };
        byId.set(block.id, call);
        toolCalls.push(call);
      }
      if (event.type === 'user' && block.type === 'tool_result' && byId.has(block.tool_use_id)) {
        byId.get(block.tool_use_id).isError = Boolean(block.is_error);
      }
    }
  }

  return {
    model: init.model ?? null,
    tools: init.tools ?? [],
    mcpServers: init.mcp_servers ?? [],
    answer: result.result ?? '',
    toolCalls,
    turns: result.num_turns ?? null,
    durationMs: result.duration_ms ?? null,
    costUsd: result.total_cost_usd ?? null,
    usage: result.usage ?? null,
    // A run that never finished (it couldn't start, or was stopped) has no result event.
    isError: Boolean(result.is_error) || !result.type,
    subtype: result.subtype ?? (result.type ? null : 'no-result'),
  };
}

/** A short label for a tool call, for tables: `Read docs/x.md`, `Bash npm run -s ds -- ...`, `get_component button`. */
export function describeCall({ name, input }) {
  const short = name.replace(/^mcp__.+?__/, '');
  const detail = input?.file_path ?? input?.pattern ?? input?.command ?? (input ? Object.values(input).filter((v) => typeof v !== 'object').join(' ') : '');
  return `${short} ${String(detail).replace(/\\/g, '/')}`.trim();
}
