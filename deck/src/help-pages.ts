// The sample help center's pages, read from the prototype's fixtures, so the
// split view on slide 5 shows the real Refunds page. Same loader as the landing page's.

export type HelpPage = {
  id: string;
  title: string;
  description: string;
  path: string;
  body: string;
};

const files = import.meta.glob<string>("../../fixtures/help/docs/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const helpPages: HelpPage[] = Object.entries(files).map(([file, source]) => {
  const path = file.replace(/^.*fixtures\/help\//, "");
  const front = source.match(/^---\n([\s\S]*?)\n---\n?/);
  return {
    id: path.replace(/^.*\//, "").replace(/\.md$/, ""),
    title: front?.[1].match(/^title:\s*(.+)$/m)?.[1].trim() ?? path,
    description: front?.[1].match(/^description:\s*(.+)$/m)?.[1].trim() ?? "",
    path,
    body: front ? source.slice(front[0].length) : source,
  };
});
