#!/usr/bin/env node
// mcp-banshee CLI — dispatch a creature from the shell.
//
//   node src/cli.mjs dispatch "Roof is leaking" --severity critical --stack 2
//   node src/cli.mjs couriers

import { COURIERS, dispatch, SEVERITIES } from "./roster.mjs";

const [cmd, ...rest] = process.argv.slice(2);

if (cmd === "dispatch") {
  const message = rest.find((a) => !a.startsWith("--")) ?? "(unspecified emergency)";
  const severity = getFlag("--severity") ?? "urgent";
  const stack = Number(getFlag("--stack") ?? 1);

  let result;
  try {
    result = dispatch({ message, severity, stack });
  } catch (err) {
    console.error(`banshee: ${err.message}`);
    process.exit(2);
  }

  const { ticket, dispatchedAt, quietHourHold, creatures, totalDecibels, acknowledgment } =
    result;
  const calls = creatures.map((c) => c.callSign).join(" + ");
  console.log(`ticket ${ticket}  ${dispatchedAt}`);
  console.log(`"${message}" [${severity}]`);
  console.log(`dispatched: ${calls}  (${totalDecibels} dB)`);
  console.log(`impact: ${creatures[0].householdImpact}`);
  console.log(`ack: ${acknowledgment}`);
  if (quietHourHold) {
    console.log("note: dispatched during quiet hours — the household may pretend not to hear");
  }
} else if (cmd === "couriers") {
  for (const c of COURIERS) {
    console.log(
      `${String(c.rank)}  ${c.severity.padEnd(8)} ${c.creature.padEnd(12)} ` +
        `${c.effect.padEnd(9)} ${c.decibels} dB  — ${c.note}`
    );
  }
} else if (cmd === "--help" || cmd === "-h" || cmd === undefined) {
  console.log(`mcp-banshee — dispatch noisy mythical creatures at your household

usage:
  banshee dispatch <message> [--severity ${SEVERITIES.join("|")}] [--stack N]
  banshee couriers
  banshee serve          (alias of the MCP stdio server, see src/server.mjs)`);
} else if (cmd === "serve") {
  console.log("banshee: use `node src/server.mjs` for the MCP stdio server");
} else {
  console.error(`banshee: unknown command "${cmd}" (try: dispatch, couriers)`);
  process.exit(2);
}

function getFlag(name) {
  const i = rest.indexOf(name);
  return i >= 0 ? rest[i + 1] : undefined;
}
