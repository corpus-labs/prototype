/**
 * Everything about the landing page that changes with the launch plan.
 * Edit here, then run `npm run build`.
 */
export const CONFIG = {
  /**
   * Where waitlist signups are sent, as a form POST with an `email` field
   * (Formspree, Basin, Getform, or your own endpoint all accept this).
   * While it's null, signups stay in the visitor's browser and the page shows
   * a preview notice, so it can't go live without one by accident.
   */
  waitlistEndpoint: null as string | null,

  /** The demand test: each visitor sees one of these prices, kept for their next visit. */
  prices: [79, 99] as const,

  betaOpens: "February 2027",
  launches: "spring 2027",

  /** Shown in the footer. */
  repo: "github.com/corpus-labs/prototype",
  contactEmail: null as string | null,
};

/**
 * The four jobs Corpus does. Ads link to `?for=<id>`, which swaps the hero's
 * lead line and tags the signup, so the waitlist shows which job draws teams in.
 */
export const JOBS = {
  ai: {
    label: "AI context",
    lead: "Give Claude, Codex, and Cursor your team’s real plans, decisions, and rules, from files you own. Switch models any time; the context stays.",
  },
  support: {
    label: "Support answers",
    lead: "Answer customers from the pages your team already keeps, with a support bot that cites its source or says it doesn’t know.",
  },
  docs: {
    label: "Docs and help center",
    lead: "Publish docs, a help center, or a team handbook, for a one-time price instead of a monthly bill.",
  },
  design: {
    label: "Design systems",
    lead: "Document your design system once, with live previews for people and the same rules for every coding agent.",
  },
} as const;

export type JobId = keyof typeof JOBS;
