# mcp-banshee

> When an alert really, really needs to be heard, an app can be ignored. A scream cannot.

A satirical [MCP](https://modelcontextprotocol.io) server for the modern household: instead of pushing a notification to a screen nobody looks at, **mcp-banshee dispatches a noisy mythical creature** to inform the occupants. The banshee wails. The dragon roars. The poltergeist throws a pan. Message delivered.

## The premise

Household notification systems have a delivery problem. Phones buzz in rooms. Watches vibrate on wrists. The notifications pile up unread in some digital graveyard, while the washing machine floods the utility room for the fourth time this month.

mcp-banshee returns notifications to their natural state: **audible, urgent, and impossible to ignore**. Each alert is fulfilled by dispatching the appropriate creature, chosen by severity:

| Severity | Creature dispatched | Audible effect | Household impact |
|---|---|---|---|
| `info` | Pixie | Tinkle | Mildly noticed |
| `notice` | Brownie | Grumble | Chores guilt-tripped |
| `warning` | Poltergeist | Crockery | Dogs alerted |
| `urgent` | Banshee | Wail | Everyone looks up |
| `critical` | Dragon | Roar | Windows rattle, plans change |

The banshee is the default courier. Per Irish tradition she keens outside the house of the person being notified; mcp-banshee assumes the washing machine, not the relative, but the volume is comparable.

## Dispatch etiquette

- One creature per alert. Stacking is available for connoisseurs (`--stack 2`).
- Banshees are scheduled no earlier than 07:00 unless the alert is `critical`, in which case all bets are off.
- Dragons require household consent and, in some terraced properties, neighbour consent.
- At Halloween, dispatch rates are uncapped and the neighbours will assume you have friends round.

## Quick start

```bash
node src/cli.mjs dispatch "Kettle boiled" --severity info
node src/cli.mjs dispatch "Dishwasher finished" --severity warning
node src/cli.mjs dispatch "Roof is leaking" --severity critical --stack 2
```

Or wire it into an MCP-speaking agent as a stdio server:

```bash
node src/server.mjs
```

Exposed MCP tools:

- `dispatch_alert` — send a notification, get a creature back.
- `list_couriers` — the current roster of mythical dispatchers.

## Tools, honestly assessed

**Strengths:** zero dependencies, sub-millisecond dispatch, unlimited scale (mythical creatures do not union), and a notification channel measured in decibels rather than open rates.

**Known limitations:** does not currently support silent mode, nightowl households, or households located next to a church. Banshee keening has no acknowledge button. Dragon-related property damage is not covered by the licence.

## Halloween clause

Between 20 October and 2 November the service reverts to its native habitat: everything is a notification, everything is a wail, and nobody questions why there is a dragon on the porch.

## Licence

MIT. No banshees were harmed. Crockery was.
