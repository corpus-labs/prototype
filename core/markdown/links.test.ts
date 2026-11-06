import { describe, expect, it } from "vite-plus/test";

import { handbookFixtures } from "./fixtures";
import { splitFrontmatter } from "./frontmatter";
import { linksIn, relativeLink, resolveLink } from "./links";

describe("relativeLink", () => {
  it("climbs out of the folder for pages elsewhere", () => {
    expect(relativeLink("docs/team/onboarding.md", "docs/engineering/deploying.md")).toBe(
      "../engineering/deploying.md",
    );
  });

  it("uses the bare file name in the same folder", () => {
    expect(relativeLink("docs/engineering/deploying.md", "docs/engineering/on-call.md")).toBe(
      "on-call.md",
    );
  });

  it("goes down into subfolders", () => {
    expect(relativeLink("docs/index.md", "docs/team/onboarding.md")).toBe("team/onboarding.md");
  });
});

describe("resolveLink", () => {
  const from = "docs/team/onboarding.md";

  it("resolves relative and root-relative links to repository paths", () => {
    expect(resolveLink(from, "../engineering/deploying.md")).toBe("docs/engineering/deploying.md");
    expect(resolveLink(from, "decisions.md")).toBe("docs/team/decisions.md");
    expect(resolveLink(from, "./decisions.md#keep-docs-in-git")).toBe("docs/team/decisions.md");
    expect(resolveLink(from, "/docs/content/content-style.md")).toBe(
      "docs/content/content-style.md",
    );
  });

  it("returns null for links that leave the repository", () => {
    expect(resolveLink(from, "https://charged.dev")).toBeNull();
    expect(resolveLink(from, "mailto:web@charged.dev")).toBeNull();
    expect(resolveLink(from, "#accounts")).toBeNull();
    expect(resolveLink(from, "../../../outside.md")).toBeNull();
  });

  it("is the inverse of relativeLink", () => {
    const to = "docs/quality/accessibility-review.md";
    expect(resolveLink(from, relativeLink(from, to))).toBe(to);
  });
});

describe("linksIn", () => {
  it("finds every link in a page, in order", () => {
    const onboarding = handbookFixtures.find(([path]) => path === "docs/team/onboarding.md")!;
    expect(linksIn(splitFrontmatter(onboarding[1]).body)).toEqual([
      "../content/content-style.md",
      "../quality/accessibility-review.md",
      "../engineering/deploying.md",
      "../engineering/on-call.md",
    ]);
  });

  it("finds no broken links between handbook pages", () => {
    const paths = new Set(handbookFixtures.map(([path]) => path));
    for (const [path, source] of handbookFixtures) {
      for (const href of linksIn(splitFrontmatter(source).body)) {
        const target = resolveLink(path, href);
        if (target) expect(paths, `${path} links to ${href}`).toContain(target);
      }
    }
  });
});
