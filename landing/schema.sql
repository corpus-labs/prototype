-- One row per email. The signup and its follow-up answers arrive as separate
-- requests and update the same row.
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
