import { describe, expect, it } from "vite-plus/test";

import { handbookFixtures } from "./fixtures";
import {
  joinFrontmatter,
  readField,
  readPageMeta,
  splitFrontmatter,
  writeField,
} from "./frontmatter";

describe("splitFrontmatter and joinFrontmatter", () => {
  for (const [path, source] of handbookFixtures) {
    it(`round-trips ${path} exactly`, () => {
      expect(joinFrontmatter(splitFrontmatter(source))).toBe(source);
    });

    it(`reads a title and description from ${path}`, () => {
      const meta = readPageMeta(splitFrontmatter(source).lines);
      expect(meta.success).toBe(true);
      if (meta.success) expect(meta.data.title.length).toBeGreaterThan(0);
    });
  }

  it("treats a page without frontmatter as all body", () => {
    expect(splitFrontmatter("# Hello\n")).toEqual({ lines: [], body: "# Hello\n" });
    expect(joinFrontmatter({ lines: [], body: "# Hello\n" })).toBe("# Hello\n");
  });
});

describe("fields", () => {
  const lines = ["title: Deploying a site", "owner: web team", "description: 'It’s quick'"];

  it("reads plain and quoted values", () => {
    expect(readField(lines, "title")).toBe("Deploying a site");
    expect(readField(lines, "description")).toBe("It’s quick");
    expect(readField(lines, "missing")).toBeUndefined();
  });

  it("keeps the original line when the value doesn't change", () => {
    expect(writeField(lines, "description", "It’s quick")).toBe(lines);
  });

  it("replaces only the edited line and leaves the others exactly as written", () => {
    expect(writeField(lines, "title", "Shipping a site")).toEqual([
      "title: Shipping a site",
      "owner: web team",
      "description: 'It’s quick'",
    ]);
  });

  it("quotes values YAML would misread, and appends missing fields", () => {
    expect(writeField(lines, "title", "Deploys: the short version")[0]).toBe(
      'title: "Deploys: the short version"',
    );
    expect(writeField([], "title", "New page")).toEqual(["title: New page"]);
    expect(readField(writeField([], "title", "Deploys: the short version"), "title")).toBe(
      "Deploys: the short version",
    );
  });

  it("rejects a page without a title, with a message that says how to fix it", () => {
    const meta = readPageMeta(["description: No title here"]);
    expect(meta.success).toBe(false);
    if (!meta.success) expect(meta.error.issues[0].message).toMatch(/Add `title:`/);
  });
});
