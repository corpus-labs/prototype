# Waitlist on Cloudflare

Status, November 7, 2026: not set up. The landing page works, but signups stay in the visitor's browser because `waitlistEndpoint` in `src/config.ts` is still `null`. An amber notice on the page says so.

## Don't wait for the domain

Every Cloudflare Pages project gets a free address like `corpus-landing.pages.dev`. The waitlist can go live there now, collect real signups, and keep them when corpus.app is renewed and pointed at the same project. Only the last step, connecting corpus.app, waits for the renewal.

Waiting has a cost: the deck promises waitlist numbers, and every day without a live form is a day with no signups to report.

## How it will work

```
corpus.app (or corpus-landing.pages.dev)
  index.html                 the landing page, built as one file
  POST /api/waitlist         a Pages Function in landing/functions/
      -> D1 database         one row per email: price shown, ad job, answers, source
```

The form posts to its own site, so there's no third-party script, no cross-site request setup, and no monthly cap. The signups live in a database on your Cloudflare account that you can query or export at any time.

## What it costs

Nothing at waitlist scale. On the free plan, Workers and Pages Functions get 100,000 requests a day, and D1 gets 5 million row reads and 100,000 row writes a day. Since September 1, 2026, D1 queries fail for the rest of the day if an account goes over, so the limits are hard, but a waitlist won't come close.

For comparison, Formspree's free plan allows 50 submissions a month. Each visitor here can send up to three records (the signup and two answers), so it would run out after roughly 17 to 50 people.

## Steps

### 1. In the repo (Claude can do this; no Cloudflare account needed)

- Add Wrangler, Cloudflare's CLI, as a pinned dev dependency, at a release at least two weeks old:
  `npm install --save-dev --save-exact wrangler --before=YYYY-MM-DD`
- Add `wrangler.toml` with the Pages output folder and the database binding:

  ```toml
  name = "corpus-landing"
  pages_build_output_dir = "dist"
  compatibility_date = "YYYY-MM-DD"
  
  [[d1_databases]]
  binding = "DB"
  database_name = "corpus-waitlist"
  database_id = "filled in at step 2"
  ```

- Add `schema.sql`, one row per email:

  ```sql
  CREATE TABLE IF NOT EXISTS signups (
    email        TEXT PRIMARY KEY,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    form         TEXT,     -- hero or final
    price_shown  INTEGER,  -- 79 or 99
    ad_job       TEXT,     -- ai, support, docs, design, or null
    would_pay    TEXT,     -- yes, maybe, no
    first_job    TEXT,     -- ai, support, docs, design
    referrer     TEXT,
    utm_source   TEXT,
    utm_medium   TEXT,
    utm_campaign TEXT,
    utm_content  TEXT,
    country      TEXT      -- from Cloudflare's request data, two letters
  );
  ```

- Add `functions/api/waitlist.ts`, which handles `POST /api/waitlist`:
  - Reads the form fields the page already sends (see README.md) and ignores anything else.
  - Checks the email's shape and caps every field's length. Returns 400 with a plain message if the email is bad.
  - Inserts the email, or updates the same row when the follow-up answers arrive (`INSERT ... ON CONFLICT(email) DO UPDATE`), so later answers never overwrite earlier ones with blanks.
  - Adds the visitor's country from Cloudflare's request data. Stores no IP address.
  - Returns 204 on success.
- Set `waitlistEndpoint: "/api/waitlist"` in `src/config.ts`. The amber preview notice disappears.
- Add scripts: `npm run db:local` (create the table locally), `npm run dev:cf` (the built page plus the function, on a local D1), and `npm run deploy`.
- Test locally: sign up, answer both questions, and confirm one row with all fields filled.
- Add one line under each form: "We'll only email you about Corpus." That's honest, and ad traffic expects it.

### 2. In your Cloudflare account (you, about 10 minutes)

Claude can't sign in for you, so these are yours. Run them from `landing/`.

1. Create a free account at cloudflare.com, if you don't have one.
2. Sign in from the terminal. A browser window opens to approve it.
   ```bash
   npx wrangler login
   ```
3. Create the database. Copy the `database_id` it prints into `wrangler.toml`.
   ```bash
   npx wrangler d1 create corpus-waitlist
   ```
4. Create the table in the real database.
   ```bash
   npx wrangler d1 execute corpus-waitlist --remote --file=schema.sql
   ```
5. Build and deploy. The first deploy creates the Pages project and prints its `pages.dev` address.
   ```bash
   npm run deploy
   ```
6. Open the address, sign up with your own email, and check that the row arrived:
   ```bash
   npx wrangler d1 execute corpus-waitlist --remote --command "SELECT * FROM signups"
   ```

### 3. After corpus.app is renewed

1. In the Cloudflare dashboard, open the Pages project, then Custom domains, and add `corpus.app`.
2. A bare domain like corpus.app needs its DNS on Cloudflare: add the domain to your Cloudflare account and switch its nameservers at the registrar to the two Cloudflare gives you. DNS on Cloudflare is free. (A subdomain like `waitlist.example.com` could stay at another DNS provider with a CNAME, but the apex can't.)
3. Once the domain shows as active, update `deck/src/facts.ts` with the waitlist's live date and rebuild the deck.

### 4. Reading the results

The deck promises to report these. Each is one command:

```bash
# Waitlist size
npx wrangler d1 execute corpus-waitlist --remote --command "SELECT COUNT(*) AS signups FROM signups"

# Willingness to pay, by the price each person saw
npx wrangler d1 execute corpus-waitlist --remote --command "SELECT price_shown, COUNT(*) AS signups, SUM(would_pay = 'yes') AS yes, SUM(would_pay = 'maybe') AS maybe, SUM(would_pay = 'no') AS no FROM signups GROUP BY price_shown"

# Which ad's job brought people in, and what they'd use first
npx wrangler d1 execute corpus-waitlist --remote --command "SELECT COALESCE(ad_job, 'none') AS ad_job, COUNT(*) AS signups FROM signups GROUP BY 1"
npx wrangler d1 execute corpus-waitlist --remote --command "SELECT first_job, COUNT(*) AS people FROM signups WHERE first_job IS NOT NULL GROUP BY 1"
```

- **Cost per signup:** spend from X Ads divided by signups whose `utm_source` is `x`. Tag every ad link with `utm_source=x` and the job, for example `https://corpus.app/?for=support&utm_source=x&utm_campaign=support`.
- **Conversion rate:** signups divided by visits. Turn on Cloudflare Web Analytics for the Pages project (free, no cookies) to count visits. For conversion per price, the function can also count page views by price shown; ask Claude to add a small `/api/visit` counter if you want that split.
- **Exporting:** add `--json` to any command above, or run `npx wrangler d1 export corpus-waitlist --remote --output=waitlist.sql` for a full backup. When it's time to email the list, export the emails into whatever mail tool you choose.

## Before the ads run

- Turn on Cloudflare Turnstile (a free bot check) if signups start showing obvious junk. Paid ad traffic attracts bots.
- Send yourself a test signup from a phone, on the live address, with an ad-style link.
- The single-file copy in `iya-submission` opens from disk, where `/api/waitlist` doesn't exist. Either share the live address with the judges, or keep that copy in preview mode and say so.

## Sources

- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits
- D1 free tier enforcement: https://developers.cloudflare.com/changelog/post/2026-09-01-d1-free-tier-limit-enforcement/
- Pages Functions configuration with Wrangler: https://developers.cloudflare.com/pages/functions/wrangler-configuration/
- Pages custom domains: https://developers.cloudflare.com/pages/platform/custom-domains/
- Formspree free plan limits (third-party summary): https://splitforms.com/formspree-free-plan-limits
