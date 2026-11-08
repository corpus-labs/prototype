/**
 * POST /api/waitlist: saves a signup, or the follow-up answers for an email
 * already on the list, to the D1 database bound as DB (see wrangler.toml).
 *
 * The page sends form fields (see README.md). Anything unknown is ignored,
 * every value is checked against what the page can send, and no IP address is
 * stored. Later answers never blank out earlier ones.
 */

// The few D1 and Pages types used here, so the landing page needs no extra
// type package.
interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  run(): Promise<unknown>;
}
interface D1Database {
  prepare(sql: string): D1Statement;
}
interface Context {
  request: Request & { cf?: { country?: string } };
  env: { DB: D1Database };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JOBS = ["ai", "support", "docs", "design"];

/** A value from a fixed list, or null. */
function oneOf(value: string | null, allowed: readonly string[]): string | null {
  return value && allowed.includes(value) ? value : null;
}

/** Free text, trimmed and capped, or null when empty. */
function text(value: string | null, max = 200): string | null {
  const v = value?.trim().slice(0, max);
  return v ? v : null;
}

function problem(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return problem(400, "Send the signup as form fields.");
  }
  const get = (key: string) => {
    const v = form.get(key);
    return typeof v === "string" ? v : null;
  };

  const email = get("email")?.trim().toLowerCase() ?? "";
  if (email.length > 254 || !EMAIL.test(email)) {
    return problem(400, "Enter an email address, like you@company.com.");
  }

  const price = Number(get("price_shown"));
  const country = text(request.cf?.country ?? null, 2);

  const row = {
    form: oneOf(get("form"), ["hero", "final"]),
    price_shown: price === 79 || price === 99 ? price : null,
    ad_job: oneOf(get("ad_job"), JOBS),
    would_pay: oneOf(get("would_pay"), ["yes", "maybe", "no"]),
    first_job: oneOf(get("first_job"), JOBS),
    referrer: text(get("referrer"), 500),
    utm_source: text(get("utm_source")),
    utm_medium: text(get("utm_medium")),
    utm_campaign: text(get("utm_campaign")),
    utm_content: text(get("utm_content")),
    country,
  };
  const columns = Object.keys(row);

  // Insert the email, or fill in the same row. COALESCE keeps an existing
  // value when this request leaves that field empty.
  const sql = `
    INSERT INTO signups (email, ${columns.join(", ")})
    VALUES (?, ${columns.map(() => "?").join(", ")})
    ON CONFLICT(email) DO UPDATE SET
      ${columns.map((c) => `${c} = COALESCE(excluded.${c}, signups.${c})`).join(",\n      ")},
      updated_at = datetime('now')`;

  try {
    await env.DB.prepare(sql)
      .bind(email, ...Object.values(row))
      .run();
  } catch {
    return problem(500, "The waitlist couldn’t save that. Try again in a minute.");
  }
  return new Response(null, { status: 204 });
}
