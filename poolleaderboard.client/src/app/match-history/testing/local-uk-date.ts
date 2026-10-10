/**
 * Formats an ISO timestamp the way the UI should show it (dd/MM/yyyy, HH:mm) in the machine's own time zone.
 * Specs use this to compute their expected value, so they pass whatever zone Karma runs in.
 */
export function expectedLocalUkDate(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
