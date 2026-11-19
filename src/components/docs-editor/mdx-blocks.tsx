// Exploration: the MDX blocks guidelines use (Do, Don't, Callout, Preview), shown inside the
// editor as they read on the page, each with a small form to change it. The file keeps the
// block's exact source, and the editor never runs it. See proposed-library-and-inbox.md.
import * as React from "react";
import type { NodeView, NodeViewConstructor } from "@milkdown/prose/view";
import type { Ctx } from "@milkdown/ctx";
import { editorViewCtx } from "@milkdown/core";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SegmentedControl } from "@/components/common";
import { parseMdx } from "@/lib/mdx-lite";
import { MdxPeople } from "@/pages/guidelines";

import { CheckIcon, QuoteIcon, XIcon } from "./icons";
import type { Block } from "./menus";

/** An MDX block the editor shows as a card. Other raw HTML still shows as text. */
export const MDX_BLOCK = /^<(Do|Dont|Callout|Preview)\b/;

export type MdxCardInfo = {
  id: number;
  dom: HTMLElement;
  value: string;
  getPos: () => number | undefined;
  /** Opens in its form, for a block just added from the slash menu. */
  fresh: boolean;
};

type Registry = {
  add: (card: MdxCardInfo) => void;
  update: (id: number, value: string) => void;
  remove: (id: number) => void;
};

let nextId = 0;
// Set by the slash menu right before it inserts a block, so the new card opens its form.
let openNext = false;

/**
 * A ProseMirror node view for the html node. MDX blocks get a container React fills in;
 * anything else falls back to the node's own rendering, which shows it as text.
 */
export function mdxNodeView(registry: Registry): NodeViewConstructor {
  return (node, _view, getPos) => {
    const value = String(node.attrs.value ?? "");
    // Returning nothing makes ProseMirror render the node the usual way.
    if (!MDX_BLOCK.test(value.trim())) return undefined as unknown as NodeView;
    const dom = document.createElement("div");
    dom.className = "docs-mdx-card";
    dom.contentEditable = "false";
    const id = ++nextId;
    registry.add({ id, dom, value, getPos, fresh: openNext });
    openNext = false;
    return {
      dom,
      update: (next) => {
        if (next.type !== node.type || !MDX_BLOCK.test(String(next.attrs.value).trim()))
          return false;
        registry.update(id, String(next.attrs.value));
        return true;
      },
      // The card handles its own clicks and typing.
      stopEvent: () => true,
      ignoreMutation: () => true,
      destroy: () => registry.remove(id),
    };
  };
}

/** Puts a block on its own line: in place of an empty paragraph, or after the current one. */
function insertBlock(value: string) {
  return (ctx: Ctx) => {
    const view = ctx.get(editorViewCtx);
    const { schema, selection } = view.state;
    const para = schema.nodes.paragraph.create(null, schema.nodes.html.create({ value }));
    const $from = selection.$from;
    const empty = $from.parent.type.name === "paragraph" && $from.parent.content.size === 0;
    openNext = true;
    view.dispatch(
      empty
        ? view.state.tr.replaceWith($from.before(), $from.after(), para)
        : view.state.tr.insert($from.after(), para),
    );
    return true;
  };
}

/** The slash menu's page blocks, offered on MDX pages only. */
export const MDX_INSERTS: Block[] = [
  {
    id: "mdx-do",
    label: "Do example",
    detail: "What to do, with a short title",
    icon: CheckIcon,
    run: insertBlock(`<Do title="">\n</Do>`),
  },
  {
    id: "mdx-dont",
    label: "Don’t example",
    detail: "What to avoid, with a short title",
    icon: XIcon,
    run: insertBlock(`<Dont title="">\n</Dont>`),
  },
  {
    id: "mdx-callout",
    label: "Callout",
    detail: "A note readers shouldn’t miss",
    icon: QuoteIcon,
    run: insertBlock(`<Callout tone="info">\n</Callout>`),
  },
];

/** A block's fields as text, written back without blank lines, which would end the block. */
function oneParagraph(text: string) {
  return text.trim().replace(/\n\s*\n+/g, "\n");
}

function attr(text: string) {
  return text.replace(/"/g, "”").trim();
}

function MdxForm({
  value,
  onSave,
  onCancel,
  onDelete,
}: {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const block = parseMdx(value).find((b) => b.t !== "front");
  const [kind, setKind] = React.useState<"do" | "dont">(block?.t === "dont" ? "dont" : "do");
  const [title, setTitle] = React.useState(block && "title" in block ? block.title : "");
  const [text, setText] = React.useState(block && "text" in block ? block.text : "");
  const [source, setSource] = React.useState(value);
  // An example's previews, as their Preview lines, and its code.
  const [previews, setPreviews] = React.useState(
    value
      .split("\n")
      .filter((l) => /^<Preview\b/.test(l.trim()))
      .map((l) => l.trim())
      .join("\n"),
  );
  const [code, setCode] = React.useState(block && "code" in block ? (block.code?.text ?? "") : "");
  const lang = block && "code" in block ? (block.code?.lang ?? "") : "";
  const example = block?.t === "do" || block?.t === "dont";
  const callout = block?.t === "callout";

  const save = () => {
    if (example) {
      const tag = kind === "do" ? "Do" : "Dont";
      const lines = [`<${tag} title="${attr(title)}">`, oneParagraph(text)];
      lines.push(
        ...previews
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => /^<Preview\b.*\/>$/.test(l)),
      );
      if (code.trim())
        lines.push(
          "```" + (lang || (code.trim().startsWith("{{") ? "twig" : "html")),
          code.replace(/\n\s*\n+/g, "\n").trimEnd(),
          "```",
        );
      onSave([...lines, `</${tag}>`].join("\n"));
    } else if (callout) {
      const tone = block.t === "callout" ? block.tone : "info";
      onSave(`<Callout tone="${tone}">\n${oneParagraph(text)}\n</Callout>`);
    } else onSave(source.trim());
  };

  return (
    <div
      className="grid gap-3 rounded-lg border bg-background p-4 text-sm shadow-xs"
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
      }}
    >
      {example && (
        <>
          <SegmentedControl
            value={kind}
            onChange={(v) => setKind(v as "do" | "dont")}
            aria-label="Example kind"
            className="justify-self-start"
            options={[
              { value: "do", label: "Do" },
              { value: "dont", label: "Don’t" },
            ]}
          />
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === "do" ? "One clear next step" : "Two primaries"}
            aria-label="Title"
          />
        </>
      )}
      {example || callout ? (
        <>
          <Textarea
            autoFocus={callout}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              callout ? "What readers shouldn’t miss" : "One or two sentences on what happens"
            }
            aria-label="Text"
            className="min-h-20"
          />
          {example && (
            <>
              <label className="grid gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Preview, one line per rendering, like{" "}
                  <code className="font-mono">{'<Preview component="button" label="Save" />'}</code>
                </span>
                <Textarea
                  value={previews}
                  onChange={(e) => setPreviews(e.target.value)}
                  spellCheck={false}
                  aria-label="Previews"
                  className="min-h-14 font-mono text-[12.5px]"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs text-muted-foreground">Code</span>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  aria-label="Code"
                  className="min-h-14 font-mono text-[12.5px]"
                />
              </label>
            </>
          )}
        </>
      ) : (
        <Input
          autoFocus
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
          aria-label="Block source"
          className="font-mono text-[13px]"
        />
      )}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={save}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" variant="ghost" className="ml-auto text-bad" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

/** A block as it reads on the page, with an Edit button on hover that opens its form. */
export function MdxCard({
  card,
  onSave,
  onDelete,
}: {
  card: MdxCardInfo;
  onSave: (value: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = React.useState(card.fresh);
  if (editing)
    return (
      <MdxForm
        value={card.value}
        onSave={(v) => {
          onSave(v);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
        onDelete={onDelete}
      />
    );
  return (
    <div className="group/mdx relative -mx-3 rounded-lg px-3 py-1 transition-colors hover:bg-muted/40">
      <MdxPeople body={card.value} />
      <Button
        size="xs"
        variant="outline"
        // Touchscreens have no hover, so the button stays visible there.
        className="absolute top-1.5 right-1.5 bg-background opacity-0 group-hover/mdx:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
        onClick={() => setEditing(true)}
      >
        Edit
      </Button>
    </div>
  );
}
