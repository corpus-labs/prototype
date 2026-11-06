# Corpus prototype

A clickable prototype of Corpus: design system documentation that people and coding agents read from the same source. The sample workspace documents Charged UI.

## Run it

```bash
npm install
npm run dev            # local dev server
npm run build:single   # one self-contained dist/index.html
npm run typecheck
```

## Stack

- React 19, Vite, TypeScript
- Tailwind CSS 4 with the Tailwind 4 neutral palettes (neutral, zinc, stone, slate, gray), switchable at runtime
- shadcn/ui, Base UI flavor, Nova style (`components.json` is set to `base-nova`, so `npx shadcn add` works from here)
- Geist and Geist Mono from Fontsource
- lucide-react icons

`scripts/port-shadcn.py` is how the components in `src/components/ui` were pulled from the shadcn registry source, doing the same style transform the CLI does.

## Where things live

- `src/data/workspace.ts`: sample content (components, tokens, guidelines, agent questions)
- `src/lib/agent-format.ts`: turns the same source into agent payloads (Markdown, JSON, llms.txt, token exports, usage checks)
- `src/lib/mdx-lite.tsx`: the small MDX dialect pages are written in
- `src/pages/*`: one file per screen
- `src/components/charged-ui.tsx`: previews of the documented design system, scoped to its own tokens

Views are plain hash routes (`#overview`, `#component-button`, `#agents`), so links to a screen can be shared.
