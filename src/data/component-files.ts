// Each component's written page is an MDX file in fixtures/charged-ui, read here the way
// Phase 1's loader will read docs/components/<id>.mdx from a content repository. Props, slots,
// and tokens come from the component's schema in workspace.ts. See proposed-library-and-inbox.md.

const files = import.meta.glob<string>("/fixtures/charged-ui/docs/components/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** Each component's MDX, by component id. */
export const componentFiles: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, source]) => [path.replace(/^.*\/([^/]+)\.mdx$/, "$1"), source]),
);
