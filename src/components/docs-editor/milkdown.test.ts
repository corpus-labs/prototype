// @vitest-environment jsdom
import { editorViewCtx } from "@milkdown/core";
import { toggleEmphasisCommand } from "@milkdown/preset-commonmark";
import { TextSelection } from "@milkdown/prose/state";
import { callCommand } from "@milkdown/utils";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { handbookFixtures } from "@core/markdown/fixtures";
import { splitFrontmatter } from "@core/markdown/frontmatter";
import { normalizeMarkdown } from "@core/markdown/normalize";
import { createDocsEditor, readMarkdown } from "./milkdown";

const editors: { destroy: () => Promise<unknown> }[] = [];

async function open(value: string) {
  const root = document.createElement("div");
  document.body.append(root);
  const editor = await createDocsEditor({ root, value });
  editors.push(editor);
  return editor;
}

/** The text position just after `needle` in the document. */
function positionAfter(editor: Awaited<ReturnType<typeof open>>, needle: string) {
  return editor.action((ctx) => {
    let found = -1;
    ctx.get(editorViewCtx).state.doc.descendants((node, pos) => {
      if (found < 0 && node.isText && node.text?.includes(needle))
        found = pos + node.text.indexOf(needle) + needle.length;
    });
    if (found < 0) throw new Error(`“${needle}” isn’t in the document.`);
    return found;
  });
}

afterEach(async () => {
  await Promise.all(editors.splice(0).map((e) => e.destroy()));
  document.body.replaceChildren();
});

describe("docs editor round-trip", () => {
  for (const [path, source] of handbookFixtures) {
    it(`reads back ${path} exactly as it loaded it`, async () => {
      const { body } = splitFrontmatter(source);
      expect(readMarkdown(await open(body))).toBe(body);
    });
  }

  it("changes only the line that was edited", async () => {
    const { body } = splitFrontmatter(
      handbookFixtures.find(([path]) => path.endsWith("deploying.md"))![1],
    );
    const editor = await open(body);
    const at = positionAfter(editor, "on a phone");
    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      view.dispatch(view.state.tr.insertText(" before merging", at));
    });
    const before = body.split("\n");
    const after = readMarkdown(editor).split("\n");
    expect(after).toHaveLength(before.length);
    expect(after.filter((line, i) => line !== before[i])).toEqual([
      "- Open the preview link on a phone before merging.",
    ]);
  });

  it("writes new italics in the house style", async () => {
    const editor = await open("Read the guide first.\n");
    const end = positionAfter(editor, "guide");
    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      view.dispatch(
        view.state.tr.setSelection(TextSelection.create(view.state.doc, end - "guide".length, end)),
      );
    });
    editor.action(callCommand(toggleEmphasisCommand.key));
    const out = readMarkdown(editor);
    expect(out).toBe("Read the _guide_ first.\n");
    expect(normalizeMarkdown(out)).toBe(out);
  });

  it("keeps raw HTML as inert text", async () => {
    const editor = await open('<script>alert("hi")</script>\n');
    const root = editor.action((ctx) => ctx.get(editorViewCtx).dom);
    expect(root.querySelector("script")).toBeNull();
  });
});
