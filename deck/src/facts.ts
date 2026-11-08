/**
 * Everything on the slides that only Mitch can fill in.
 * Anything left as null renders as a visible amber [TODO] on the slide,
 * so nothing ships half-finished by accident.
 */
export const FACTS = {
  /** Contact email for the judges. A usc.edu address reads best here. */
  email: "kostelec@usc.edu" as string | null,
  /** Demo video link, without https://. */
  demoVideo: null as string | null,
  /** Where judges can click through the prototype, without https://. */
  prototypeUrl: "demo.corpus.app" as string | null,
  waitlist: {
    url: "corpus.app",
    /** When the landing page went live, like "Nov 2026". */
    liveSince: null as string | null,
    /** Signups so far, like "48". */
    signups: null as string | null,
  },
  /** Targets for the IYA Venture Showcase. */
  targets: {
    waitlist: "250 signups" as string | null,
    betaTeams: "10 teams" as string | null,
    paidLicenses: "25 sold" as string | null,
  },
  /** What the hosted plan costs. */
  hostedPrice: "$7 a month" as string | null,
};
