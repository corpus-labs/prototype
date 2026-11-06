import { describe, expect, it } from "vite-plus/test";

import { handbookFixtures } from "./fixtures";
import { splitFrontmatter } from "./frontmatter";
import { normalizeMarkdown } from "./normalize";

describe("normalizeMarkdown", () => {
  it("finds the six handbook pages", () => {
    expect(handbookFixtures).toHaveLength(6);
  });

  for (const [path, source] of handbookFixtures) {
    it(`leaves ${path} unchanged, since fixtures are stored in the house style`, () => {
      const { body } = splitFrontmatter(source);
      expect(normalizeMarkdown(body)).toBe(body);
    });
  }

  it("rewrites other styles into the house style", () => {
    expect(normalizeMarkdown("* one\n* two\n\n*soft* __loud__\n\nTitle\n=====\n\n***\n")).toBe(
      "- one\n- two\n\n_soft_ **loud**\n\n# Title\n\n---\n",
    );
  });

  it("keeps a body that has been normalized once stable", () => {
    const once = normalizeMarkdown("+ a\n+ b\n\n1) first\n2) second\n");
    expect(normalizeMarkdown(once)).toBe(once);
  });
});
