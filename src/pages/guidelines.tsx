import * as React from "react"
import { CheckIcon, InfoIcon, PenLineIcon, XIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CButton, CuiScope } from "@/components/charged-ui"
import {
  AgentPane,
  CodeBlock,
  DocSection,
  Facts,
  PageHeader,
  ReaderSwitch,
  proseClass,
  useEffectiveReader,
  type Hover,
} from "@/components/common"
import { guidelineFiles, workspace } from "@/data/workspace"
import { guideLines } from "@/lib/agent-format"
import { Inline, parseMdx, sectionize, type Block } from "@/lib/mdx-lite"
import { navigate } from "@/lib/router"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

function BlockView({ b, dark }: { b: Block; dark: boolean }) {
  switch (b.t) {
    case "h1":
    case "h2":
      return <h2 className="text-xl leading-snug font-semibold tracking-[-0.02em]">{b.text}</h2>
    case "h3":
      return <h3 className="text-base font-semibold">{b.text}</h3>
    case "p":
      return (
        <p className={cn(proseClass, "text-pretty")}>
          <Inline text={b.text} />
        </p>
      )
    case "ul":
      return (
        <ul className={cn(proseClass, "grid list-disc gap-2 pl-5 marker:text-muted-foreground/60")}>
          {b.items.map((x, i) => (
            <li key={i}>
              <Inline text={x} />
            </li>
          ))}
        </ul>
      )
    case "code":
      return <CodeBlock code={b.text} header={<span>{b.lang || "code"}</span>} />
    case "do":
    case "dont":
      return (
        <div className={cn("max-w-[68ch] border-l-2 py-0.5 pl-4", b.t === "do" ? "border-good" : "border-bad")}>
          <p className={cn("flex items-center gap-1 text-sm font-medium", b.t === "do" ? "text-good" : "text-bad")}>
            {b.t === "do" ? <CheckIcon className="size-4" /> : <XIcon className="size-4" />}
            {b.t === "do" ? "Do" : "Don’t"}
            {b.title && <span className="ml-0.5 text-foreground">{b.title}</span>}
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
            <Inline text={b.text} />
          </p>
        </div>
      )
    case "preview":
      return (
        <CuiScope dark={dark} className="flex min-h-40 items-center justify-center rounded-xl bg-(--cui-subtle) p-8">
          {b.attrs.component === "button" ? (
            <CButton variant={(b.attrs.variant as "primary") ?? "secondary"} label={b.attrs.label} />
          ) : (
            <span className="text-sm text-muted-foreground">Preview of {b.attrs.component}</span>
          )}
        </CuiScope>
      )
    case "callout":
      return (
        <Alert className="max-w-[68ch]">
          <InfoIcon />
          <AlertDescription className="text-foreground/90">
            <Inline text={b.text} />
          </AlertDescription>
        </Alert>
      )
    default:
      return null
  }
}

/** Renders a page’s MDX as people see it. Sections share keys with the agent view. */
export function MdxPeople({ body, hover, onHover, className }: { body: string; hover?: Hover; onHover?: (h: Hover) => void; className?: string }) {
  const { dark } = useStore()
  const blocks = parseMdx(body).filter((b) => b.t !== "front")
  const sections = sectionize(blocks)
  return (
    <article className={cn("grid max-w-[72ch] gap-10", className)}>
      {sections.map((s, i) => (
        <DocSection key={s.key + i} k={s.key} hover={hover} onHover={onHover}>
          <div className="grid gap-5">
            {s.blocks.map((b, j) => (
              <BlockView key={j} b={b} dark={dark} />
            ))}
          </div>
        </DocSection>
      ))}
    </article>
  )
}

export function GuidelinesIndex() {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-12">
      <PageHeader title="Guidelines" description="How the components work together: choosing between them, writing their labels, and spacing them." />
      <ul className="mt-10 divide-y border-y">
        {guidelineFiles.map((g) => (
          <li key={g.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <a href={`#guide-${g.id}`} className="group -m-1 min-w-0 rounded-md p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <p className="text-[15px] font-medium underline-offset-4 group-hover:underline">{g.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
            </a>
            <div className="flex shrink-0 items-center gap-4">
              <span className="text-sm text-muted-foreground">Updated {g.updated}</span>
              <Button variant="outline" size="sm" onClick={() => navigate(`edit-${g.id}`)}>
                <PenLineIcon />
                Edit
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function GuideReader({ id }: { id: string }) {
  const { reader, setReader, saved } = useStore()
  const mode = useEffectiveReader(reader)
  const [hover, setHover] = React.useState<Hover>({ key: null, from: null })
  const g = guidelineFiles.find((x) => x.id === id)
  if (!g) return <p className="p-8 text-sm text-muted-foreground">That guideline doesn’t exist.</p>
  const body = saved[id] ?? g.body
  const lines = guideLines(body)
  const request = (
    <>
      <span className="text-muted-foreground">GET</span> {workspace.site}/guidelines/{g.id}.md
    </>
  )

  return (
    <div className={cn("mx-auto w-full px-4 py-8 md:px-8 md:py-12", mode === "split" ? "max-w-[1480px]" : "max-w-[1120px]")}>
      <PageHeader
        title={g.title}
        description={g.description}
        actions={
          <>
            <ReaderSwitch value={reader} onChange={setReader} />
            <Button variant="outline" size="sm" onClick={() => navigate(`edit-${g.id}`)}>
              <PenLineIcon />
              Edit
            </Button>
          </>
        }
        meta={
          <Facts
            items={[
              ["File", <code className="font-mono text-[13px]">{g.path}</code>],
              ["Updated", g.updated],
            ]}
          />
        }
      />
      <div className="mt-10">
        {mode === "people" && <MdxPeople body={body} />}
        {mode === "agents" && (
          <div className="grid gap-3">
            <p className="max-w-[68ch] text-sm text-muted-foreground">
              Served as plain Markdown at this page’s URL plus <code className="font-mono text-xs">.md</code>, and listed in llms.txt.
            </p>
            <AgentPane request={request} lines={lines} />
          </div>
        )}
        {mode === "split" && (
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-8">
            <MdxPeople body={body} hover={hover} onHover={setHover} />
            <div className="min-w-0">
              <AgentPane className="sticky top-16 max-h-[calc(100svh-5.5rem)]" request={request} lines={lines} hover={hover} onHover={setHover} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
