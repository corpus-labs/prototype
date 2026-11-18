// @vitest-environment jsdom
import { editorViewCtx } from "@milkdown/core";
import {
  insertImageCommand,
  toggleEmphasisCommand,
  updateCodeBlockLanguageCommand,
} from "@milkdown/preset-commonmark";
import { TextSelection } from "@milkdown/prose/state";
import { callCommand } from "@milkdown/utils";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { componentFiles, guidelineFiles } from "@/data/workspace";
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

  it("reads back to-dos and strikethrough exactly as written", async () => {
    const body = "- [x] Check the preview link\n- [ ] Tell the team\n\nThe ~~old~~ new way.\n";
    expect(readMarkdown(await open(body))).toBe(body);
  });

  it("keeps raw HTML as inert text", async () => {
    const editor = await open('<script>alert("hi")</script>\n');
    const root = editor.action((ctx) => ctx.get(editorViewCtx).dom);
    expect(root.querySelector("script")).toBeNull();
  });

  it("pads aligned tables into one house shape", async () => {
    const editor = await open("| A | B |\n| :- | -: |\n| 1 | 2 |\n");
    expect(readMarkdown(editor)).toBe("| A  |  B |\n| :- | -: |\n| 1  |  2 |\n");
  });

  it("reads back an image, and its link and alt text, exactly as written", async () => {
    const body = "![A ship in a bottle](https://example.com/ship.png)\n";
    expect(readMarkdown(await open(body))).toBe(body);
  });

  it("sets a code block's language, which survives the round trip", async () => {
    const editor = await open("```\nconst x = 1;\n```\n");
    const applied = editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const $from = view.state.selection.$from;
      let depth = 0;
      for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type.name === "code_block") depth = d;
      }
      if (!depth) throw new Error("The cursor is not in the code block.");
      return callCommand(updateCodeBlockLanguageCommand.key, {
        pos: $from.before(depth),
        language: "typescript",
      })(ctx);
    });
    expect(applied).toBe(true);
    expect(readMarkdown(editor)).toBe("```typescript\nconst x = 1;\n```\n");
  });

  it("inserts an image carrying its source and alt text", async () => {
    const editor = await open("One.\n");
    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 5)));
    });
    editor.action(
      callCommand(insertImageCommand.key, { src: "https://x.test/a.png", alt: "A ship" }),
    );
    expect(readMarkdown(editor)).toBe("One.![A ship](https://x.test/a.png)\n");
  });
});

// Guidelines and components are MDX pages in the same editor. Their Do, Don't, Callout,
// and Preview blocks show as cards, and the file has to come back exactly as written.
describe("MDX pages in the docs editor", () => {
  const files = [
    ...guidelineFiles.map((g) => [g.id, g.body] as const),
    ...Object.entries(componentFiles),
  ];
  it.each(files)("keeps %s exactly as written", async (_id, file) => {
    const { body } = splitFrontmatter(file);
    const editor = await open(body);
    expect(readMarkdown(editor)).toBe(body);
  });
});
