# Corpus landing page

The waitlist page for corpus.app. One page, built with the deck's stack (React, Tailwind 4, Geist), using screenshots from the prototype.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # one self-contained file: dist/index.html
```

## Before it goes live

Set `waitlistEndpoint` in `src/config.ts`. Until then, signups stay in the visitor's browser and an amber notice says so at the bottom of the page.

The page sends a form POST with these fields, so a Formspree form URL (or Basin, Getform, or your own endpoint) works as is:

| Field               | What it holds                                                           |
| ------------------- | ----------------------------------------------------------------------- |
| `email`             | The signup                                                              |
| `form`              | Which form they used: `hero` or `final`                                 |
| `price_shown`       | The price this visitor saw: 79 or 99                                    |
| `ad_job`            | The job from the ad link, if any: `ai`, `support`, `docs`, or `design`  |
| `would_pay`         | Their answer to "Would your team pay $X once?": `yes`, `maybe`, or `no` |
| `first_job`         | What they'd use it for first                                            |
| `utm_*`, `referrer` | Where they came from                                                    |

A signup and its two follow-up answers arrive as separate records with the same email.

## The demand test

- Each visitor sees $79 or $99, picked at random and kept for their next visit. Force one with `?price=79` or `?price=99`.
- Each ad set links to one job: `?for=ai`, `?for=support`, `?for=docs`, or `?for=design`. That swaps the hero's lead line, marks the matching job on the page, and tags the signup.

Hosting is any static host. `dist/index.html` is the whole site.
