# Brainwright

An MCP server for spec-driven work with AI agents.

## Status

Rebuilding. This is a skeleton: the server starts over stdio and registers no tools yet.

## Requirements

- Node.js 22.12 or later

## Setup

```bash
npm ci
npm run build
npm test
```

## Claude Code

Add a `.mcp.json` at your project root, using the absolute path to `dist/index.js`:

```json
{
  "mcpServers": {
    "brainwright": {
      "command": "node",
      "args": ["/absolute/path/to/brainwright/dist/index.js"],
      "env": { "BRAINWRIGHT_ROOT": "." }
    }
  }
}
```

`BRAINWRIGHT_ROOT` is the project root. A relative value is resolved against the server's working directory, so use an absolute path if your client starts servers elsewhere.

## Files

Generated specs go to `specs-out-mcp/`, below the project root. Nothing else is read or written there.

## License

[MIT](LICENSE)
