import { CONFIG, JOBS, type JobId } from "./config";

/** Storage can throw in private windows or with site data blocked. */
function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Nothing to do: the page works without storage.
  }
}

/**
 * Who's visiting, for the demand test: the price they see (kept across visits,
 * or forced with `?price=99`), the job their ad was about (`?for=support`), and
 * where they came from. Every signup carries this.
 */
function readVisit() {
  const params = new URLSearchParams(window.location.search);

  const forced = Number(params.get("price"));
  const kept = Number(read("corpus.price"));
  const prices: readonly number[] = CONFIG.prices;
  const price = prices.includes(forced)
    ? forced
    : prices.includes(kept)
      ? kept
      : prices[Math.floor(Math.random() * prices.length)];
  write("corpus.price", String(price));

  const forParam = params.get("for");
  const job = forParam && forParam in JOBS ? (forParam as JobId) : null;

  const utm: Record<string, string> = {};
  for (const [k, v] of params) if (k.startsWith("utm_")) utm[k] = v;

  return { price, job, utm, referrer: document.referrer || null };
}

export const visit = readVisit();
