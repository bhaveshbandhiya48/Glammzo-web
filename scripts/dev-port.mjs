/** Glammzo-web local dev port — keep in sync with package.json dev/start scripts. */
export const DEV_PORT = 4008

/** Ports to free before dev (current + legacy defaults). */
export const DEV_PORTS_TO_KILL = [DEV_PORT, 3000, 3001, 3002]
