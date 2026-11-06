// Test helper: the handbook fixture pages, keyed by repository path (docs/<folder>/<page>.md).
// import.meta.glob keeps tests free of Node file APIs, so they read the files the app reads.
const files = import.meta.glob<string>("/fixtures/handbook/docs/**/*.md", { query: "?raw", import: "default", eager: true })

export const handbookFixtures: [path: string, source: string][] = Object.entries(files).map(([file, source]) => [
  file.replace("/fixtures/handbook/", ""),
  source,
])
