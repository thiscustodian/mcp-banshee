#!/usr/bin/env node
// Self-check: exercise the roster, dispatcher, and MCP server over real stdio.

import { spawnSync } from "node:child_process";
import { dispatch, courierFor, COURIERS } from "./roster.mjs";

let failures = 0;
function check(name, cond) {
  const status = cond ? "ok  " : "FAIL";
  if (!cond) failures++;
  console.log(`${status}  ${name}`);
}

// roster
check("five couriers on the roster", COURIERS.length === 5);
check("banshee handles urgent", courierFor("urgent").creature === "Banshee");
check("dragon handles critical", courierFor("critical").creature === "Dragon");

// dispatch
const d = dispatch({ message: "test", severity: "warning", stack: 3 });
check("stack=3 summons three poltergeists", d.creatures.length === 3);
check("ticket ids are deterministic", d.ticket === dispatch({ message: "test", severity: "warning", stack: 3 }).ticket);
check("decibels stack sublinearly", d.totalDecibels > 74 && d.totalDecibels < 74 * 3);

let threw = false;
try { courierFor("apocalyptic"); } catch { threw = true; }
check("unknown severity rejected", threw);

// CLI
const cli = spawnSync(process.execPath, ["src/cli.mjs", "dispatch", "smoke", "--severity", "info"], { cwd: import.meta.dirname + "/..", encoding: "utf8" });
check("CLI exits 0", cli.status === 0);
check("CLI mentions pixie", /pixie-01/.test(cli.stdout));

// MCP server over real stdio
const rpc = [
  { jsonrpc: "2.0", id: 1, method: "initialize" },
  { jsonrpc: "2.0", method: "notifications/initialized" },
  { jsonrpc: "2.0", id: 2, method: "tools/list" },
  { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "dispatch_alert", arguments: { message: "roof", severity: "critical", stack: 2 } } },
].map((m) => JSON.stringify(m)).join("\n") + "\n";

const srv = spawnSync(process.execPath, ["src/server.mjs"], {
  cwd: import.meta.dirname + "/..",
  input: rpc,
  encoding: "utf8",
});
const lines = srv.stdout.trim().split("\n").map((l) => JSON.parse(l));
check("server replies to 3 requests, silent on notification", lines.length === 3);
check("initialize reports server name", lines[0]?.result?.serverInfo?.name === "mcp-banshee");
check("tools/list exposes 2 tools", lines[1]?.result?.tools?.length === 2);
const call = lines[2]?.result?.structuredContent;
check("dispatch_alert returns two dragons", call?.creatures?.length === 2 && call.creatures[0].creature === "Dragon");

console.log(failures === 0 ? "\nall checks passed" : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
