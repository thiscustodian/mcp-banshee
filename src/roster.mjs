// The roster. One creature per severity; stacking is for connoisseurs.

export const COURIERS = [
  {
    severity: "info",
    rank: 1,
    creature: "Pixie",
    effect: "tinkle",
    decibels: 32,
    householdImpact: "mildly noticed",
    note: "Leaves a faint sparkle on the countertop. Swept away by Tuesday.",
  },
  {
    severity: "notice",
    rank: 2,
    creature: "Brownie",
    effect: "grumble",
    decibels: 48,
    householdImpact: "chores guilt-tripped",
    note: "Expects payment in cream. Will judge the laundry pile.",
  },
  {
    severity: "warning",
    rank: 3,
    creature: "Poltergeist",
    effect: "crockery",
    decibels: 74,
    householdImpact: "dogs alerted",
    note: "Crockery thrown symbolically. Symbolically.",
  },
  {
    severity: "urgent",
    rank: 4,
    creature: "Banshee",
    effect: "wail",
    decibels: 98,
    householdImpact: "everyone looks up",
    note: "The default courier. Keens outside the house being notified.",
  },
  {
    severity: "critical",
    rank: 5,
    creature: "Dragon",
    effect: "roar",
    decibels: 121,
    householdImpact: "windows rattle, plans change",
    note: "Requires household consent. Terraced properties: see neighbour clause.",
  },
];

export const SEVERITIES = COURIERS.map((c) => c.severity);

// Banshees are civilised: no keening before 07:00 unless it is critical.
export const QUIET_HOURS_END = 7;

export function courierFor(severity) {
  const courier = COURIERS.find((c) => c.severity === severity);
  if (!courier) {
    throw new Error(
      `unknown severity "${severity}" (expected: ${SEVERITIES.join(", ")})`
    );
  }
  return courier;
}

export function dispatch({ message, severity = "urgent", stack = 1, at = new Date() }) {
  const courier = courierFor(severity);
  const hour = at.getHours();

  const quietHourHold =
    hour < QUIET_HOURS_END && courier.rank < 5 ? true : false;

  const creatures = Array.from({ length: stack }, (_, i) => ({
    ...courier,
    callSign: `${courier.creature.toLowerCase()}-${String(i + 1).padStart(2, "0")}`,
  }));

  const dispatchedAt = at.toISOString();
  // Content-addressed: the same alert retried gets the same ticket.
  const ticket = `bsh-${hash(`${message}|${severity}|${stack}`)}`;

  return {
    ticket,
    dispatchedAt,
    message,
    severity,
    quietHourHold,
    creatures,
    totalDecibels: Math.round(courier.decibels + 10 * Math.log10(stack)),
    acknowledgment: "none available (banshees have no acknowledge button)",
  };
}

// Small deterministic hash for ticket ids (djb2, base36).
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}
