export const TRADES = [
  "plumber",
  "electrician",
  "carpenter",
  "painter",
  "mechanic",
  "welder",
  "hairdresser",
  "tailor",
  "mason",
  "ac technician",
] as const;

export type Trade = (typeof TRADES)[number];
