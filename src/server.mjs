#!/usr/bin/env node
// mcp-banshee — minimal MCP stdio server (zero dependencies).
//
// Speaks JSON-RPC 2.0 over stdio (newline-delimited), implementing just
// enough of the MCP surface for a satirical courier service:
//
//   initialize                      -> capabilities + server info
//   tools/list                      -> dispatch_alert, list_couriers
//   tools/call dispatch_alert       -> {message, severity?, stack?}
//   tools/call list_couriers        -> the roster
//   ping                            -> {}

import { COURIERS, SEVERITIES, dispatch } from "./roster.mjs";

const SERVER_INFO = {
  name: "mcp-banshee",
  title: "Banshee Household Dispatch",
  version: "0.1.0",
};

const TOOLS = [
  {
    name: "dispatch_alert",
    description:
      "Notify the household by dispatching a mythical creature. Severity picks the courier; stack summons more of them.",
    inputSchema: {
      type: "object",
      properties: {
        message: { type: "string", description: "What the household must be told." },
        severity: {
          type: "string",
          enum: SEVERITIES,
          description: "info | notice | warning | urgent | critical (default urgent)",
        },
        stack: {
          type: "integer",
          minimum: 1,
          maximum: 5,
          description: "How many of the same creature to dispatch (default 1).",
        },
      },
      required: ["message"],
    },
  },
  {
    name: "list_couriers",
    description: "Return the current roster of mythical dispatchers.",
    inputSchema: { type: "object", properties: {} },
  },
];

function handle(req) {
  const { method, params } = req;

  if (method === "initialize") {
    return {
      protocolVersion: "2025-06-18",
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO,
      instructions:
        "Alerts are delivered audibly by mythical creatures. There is no silent mode.",
    };
  }

  if (method === "tools/list") {
    return { tools: TOOLS };
  }

  if (method === "tools/call") {
    const name = params?.name;
    const args = params?.arguments ?? {};

    if (name === "list_couriers") {
      return toolResult(COURIERS);
    }
    if (name === "dispatch_alert") {
      try {
        const result = dispatch({
          message: String(args.message ?? "(unspecified emergency)"),
          severity: args.severity ?? "urgent",
          stack: Math.min(Math.max(Number(args.stack ?? 1), 1), 5),
        });
        return toolResult(result);
      } catch (err) {
        return { isError: true, content: [{ type: "text", text: err.message }] };
      }
    }
    return { isError: true, content: [{ type: "text", text: `unknown tool "${name}"` }] };
  }

  if (method === "ping") {
    return {};
  }

  return null; // notifications (no id) and unknown methods
}

function toolResult(payload) {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

// --- stdio loop ---------------------------------------------------------

import { createInterface } from "node:readline";

createInterface({ input: process.stdin }).on("line", (line) => {
  line = line.trim();
  if (!line) return;

  let req;
  try {
    req = JSON.parse(line);
  } catch {
    write({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } });
    return;
  }

  // Notifications get no response per JSON-RPC; MCP clients expect this.
  if (req.id === undefined) return;

  const result = handle(req);
  if (result === null) {
    write({ jsonrpc: "2.0", id: req.id, error: { code: -32601, message: `method not found: ${req.method}` } });
  } else {
    write({ jsonrpc: "2.0", id: req.id, result });
  }
});

function write(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}
