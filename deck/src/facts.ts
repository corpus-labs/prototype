/**
 * Everything on the slides that only Mitch can fill in.
 * Anything left as null renders as a visible amber [TODO] on the slide,
 * so nothing ships half-finished by accident.
 */
export const FACTS = {
  /** Contact email for the judges. A usc.edu address reads best here. */
  email: null as string | null,
  /** Demo video link, without https://. */
  demoVideo: null as string | null,
  /** Where judges can click through the prototype, without https://. */
  prototypeUrl: null as string | null,
  /** The public repo. */
  repo: "github.com/corpus-labs/prototype",
  waitlist: {
    url: "corpus.app",
    /** When the landing page went live, like "Nov 2026". */
    liveSince: null as string | null,
    /** Signups so far, like "48". */
    signups: null as string | null,
  },
  /** Targets for the IYA Venture Showcase. */
  targets: {
    waitlist: null as string | null,
    betaTeams: null as string | null,
    paidLicenses: null as string | null,
  },
  /** A sourced number for how many teams fit the first market. */
  market: null as string | null,
  /** What the hosted plan costs, like "$8 a month" or "included the first year". */
  hostedPrice: null as string | null,
};
