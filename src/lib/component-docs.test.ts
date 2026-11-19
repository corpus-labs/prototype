import { describe, expect, it } from "vite-plus/test";

import { componentFiles } from "@/data/component-files";
import { components, drafts } from "@/data/workspace";
import { componentRules } from "@/lib/agent-format";
import { withWritten, writtenFrom } from "@/lib/component-docs";
import { parseMdx } from "@/lib/mdx-lite";

describe("Do and Don't blocks with previews and code", () => {
  const [block] = parseMdx(`<Do title="Keep the label">
Show the spinner beside “Save changes”.
<Preview component="button" variant="primary" label="Save changes" loading />
\`\`\`twig
{{ include('charged_ui:button', { loading: true }) }}
\`\`\`
</Do>`);

  it("reads the caption, each preview, and the code", () => {
    expect(block).toMatchObject({
      t: "do",
      title: "Keep the label",
      text: "Show the spinner beside “Save changes”.",
      previews: [
        { component: "button", variant: "primary", label: "Save changes", loading: "true" },
      ],
      code: { lang: "twig", text: "{{ include('charged_ui:button', { loading: true }) }}" },
    });
  });

  it("keeps plain examples as they were", () => {
    const [plain] = parseMdx(`<Dont title="Two primaries">\nTwo primary buttons compete.\n</Dont>`);
    expect(plain).toMatchObject({ t: "dont", text: "Two primary buttons compete.", previews: [] });
    expect(plain).not.toHaveProperty("code");
  });
});

describe("a component's written page", () => {
  it("has a file for every component", () => {
    expect(Object.keys(componentFiles).sort()).toEqual(components.map((c) => c.id).sort());
  });

  it("reads Button's rules in order, and its examples with their previews and code", () => {
    const w = writtenFrom(componentFiles.button);
    expect(w.rules).toHaveLength(7);
    expect(w.rules?.[0]).toBe("MUST NOT place more than one variant primary in the same view.");
    expect(w.examples.map((e) => [e.do.previews.length, e.dont.previews.length])).toEqual([
      [2, 2],
      [1, 1],
      [1, 0],
    ]);
    expect(w.examples[2].dont).toMatchObject({ lang: "html", previews: [] });
    expect(w.examples[2].dont.code).toContain('<a class="btn btn-primary"');
    expect(w.sections).toEqual([]);
  });

  it("leaves out sections a page doesn't have", () => {
    const tabs = writtenFrom(componentFiles.tabs);
    expect(tabs.whenToUse).toBeUndefined();
    expect(tabs.rules).toBeUndefined();
  });

  it("keeps an answer added from the inbox as its own section", () => {
    const file = `${componentFiles.button.trimEnd()}\n\n${drafts["q-loading"].text.trim()}\n`;
    const button = withWritten(
      components.find((c) => c.id === "button")!,
      file,
    );
    expect(button.sections?.map((s) => s.title)).toEqual(["Loading state"]);
    expect(button.examples).toHaveLength(3);
    expect(componentRules(button, { resolved: [] })).toHaveLength(7);
  });
});
