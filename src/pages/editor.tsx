import * as React from "react"
import {
  CheckIcon,
  CodeIcon,
  ComponentIcon,
  GitBranchIcon,
  GitPullRequestIcon,
  Heading2Icon,
  InfoIcon,
  ListIcon,
  Undo2Icon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/toast"
import { Dot, Facts, PageHeader, SegmentedControl } from "@/components/common"
import { drafts, questions } from "@/data/workspace"
import { slug } from "@/lib/mdx-lite"
import { navigate } from "@/lib/router"
import { fileMeta, templateFor, useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { MdxPeople } from "@/pages/guidelines"

export function modelLabel(provider: string, model: string) {
  const m = model.match(/^claude-(sonnet|haiku|opus)-(\d+)-(\d+)$/)
  if (provider === "anthropic" && m) return `Claude ${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]}.${m[3]}`
  return model || "your model"
}

function useWide(query = "(min-width: 1024px)") {
  const [wide, setWide] = React.useState(() => window.matchMedia(query).matches)
  React.useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setWide(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [query])
  return wide
}

function diffStats(before: string, after: string) {
  const a = before.split("\n")
  const b = after.split("\n")
  const count = (xs: string[]) => xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>())
  const ca = count(a)
  const cb = count(b)
  let added = 0
  let removed = 0
  cb.forEach((n, k) => (added += Math.max(0, n - (ca.get(k) ?? 0))))
  ca.forEach((n, k) => (removed += Math.max(0, n - (cb.get(k) ?? 0))))
  return { added, removed }
}

function answersIn(fileId: string, body: string) {
  return questions.filter(
    (q) =>
      (q.id === "q-loading" && fileId === "button" && /##\s+Loading state/i.test(body)) ||
      (q.id === "q-nesting" && fileId === "card" && /##\s+Nesting/i.test(body))
  )
}

const SNIPPETS: { label: string; icon: React.ComponentType<{ className?: string }>; text: string }[] = [
  { label: "Heading", icon: Heading2Icon, text: "\n## Heading\n" },
  { label: "List", icon: ListIcon, text: "\n- Item\n" },
  { label: "Inline code", icon: CodeIcon, text: "`code`" },
  { label: "Do example", icon: CheckIcon, text: '\n<Do title="Title">\nWhat to do.\n</Do>\n' },
  { label: "Don’t example", icon: XIcon, text: '\n<Dont title="Title">\nWhat to avoid.\n</Dont>\n' },
  { label: "Live preview", icon: ComponentIcon, text: '\n<Preview component="button" variant="primary" label="Save changes" />\n' },
  { label: "Callout", icon: InfoIcon, text: '\n<Callout tone="info">\nNote.\n</Callout>\n' },
]

export function Editor({ id }: { id: string }) {
  const { files, saved, setFile, commit, resolved, inReview, ai, pendingDraft, setPendingDraft } = useStore()
  const meta = fileMeta(id)
  const wide = useWide()
  const [mode, setMode] = React.useState<"write" | "preview" | "split">(() => (window.matchMedia("(min-width: 1024px)").matches ? "split" : "write"))
  const effective = mode === "split" && !wide ? "write" : mode
  const area = React.useRef<HTMLTextAreaElement>(null)
  const placed = React.useRef(false)
  const timer = React.useRef<number | null>(null)
  const [drafting, setDrafting] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<{ qid: string; lines: number; before: string } | null>(null)
  const [prompt, setPrompt] = React.useState("")
  const [hint, setHint] = React.useState<string | null>(null)
  const [commitOpen, setCommitOpen] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [target, setTarget] = React.useState<"main" | "pr">("main")

  const body = files[id] ?? (meta?.kind === "component" ? templateFor(id) : "")
  const base = saved[id]
  const isNew = base === undefined
  const dirty = isNew || body !== base
  const open = questions.filter((q) => q.status === "gap" && q.fileId === id && !resolved.includes(q.id))

  React.useEffect(() => {
    if (files[id] === undefined && meta?.kind === "component") setFile(id, templateFor(id))
  }, [id, files, meta?.kind, setFile])

  React.useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current)
  }, [])

  if (!meta) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center text-sm text-muted-foreground">
        There’s no page called “{id}”.
      </div>
    )
  }

  const insert = (text: string) => {
    const el = area.current
    // Before the first click into the source, the caret sits at 0, above the frontmatter. Append instead.
    const start = el && placed.current ? el.selectionStart : body.length
    const end = el && placed.current ? el.selectionEnd : body.length
    const next = body.slice(0, start) + text + body.slice(end)
    setFile(id, next)
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      el.setSelectionRange(start + text.length, start + text.length)
    })
  }

  const runDraft = (qid: string) => {
    const d = drafts[qid]
    if (!d || d.fileId !== id || drafting) return
    const before = body
    const start = body.replace(/\s*$/, "\n")
    const text = d.text
    let i = 0
    setHint(null)
    setDrafting(qid)
    setNotice(null)
    timer.current = window.setInterval(() => {
      i = Math.min(text.length, i + Math.ceil(text.length / 45))
      setFile(id, start + text.slice(0, i))
      if (area.current) area.current.scrollTop = area.current.scrollHeight
      if (i >= text.length) {
        if (timer.current) window.clearInterval(timer.current)
        timer.current = null
        setDrafting(null)
        setPendingDraft(null)
        setMessage(d.commit)
        setNotice({ qid, lines: text.trim().split("\n").length, before })
      }
    }, 28)
  }

  const submitPrompt = () => {
    const p = prompt.toLowerCase()
    const match =
      (/load|spinner|busy/.test(p) && id === "button" && "q-loading") || (/nest|inside|card in/.test(p) && id === "card" && "q-nesting") || null
    if (match && !resolved.includes(match)) {
      setPrompt("")
      runDraft(match)
    } else {
      setHint("In this prototype the assistant drafts answers to open agent questions. Open Button or Card to try it.")
    }
  }

  const doCommit = () => {
    const answering = answersIn(id, body).filter((q) => !resolved.includes(q.id))
    commit({ fileId: id, message: message || `Update ${meta.title}`, mode: target })
    setCommitOpen(false)
    setNotice(null)
    if (target === "main") {
      toast.add({
        type: "success",
        title: "Pushed to main",
        description: answering.length
          ? `Agents now get an answer to “${answering[0].text}” The site rebuilds in about 30 seconds.`
          : "The site and agent context rebuild in about 30 seconds.",
      })
      navigate(meta.kind === "component" ? `component-${id}` : `guide-${id}`)
    } else {
      toast.add({
        title: "Pull request #42 opened",
        description: `Branch docs/${slug(message || meta.title)} is waiting for review. Agents keep the current answer until it merges.`,
      })
    }
  }

  const drafted = answersIn(id, body).map((q) => q.id)
  const stats = diffStats(base ?? "", body)
  const pending = open.find((q) => q.id === pendingDraft)
  const model = modelLabel(ai.provider, ai.model)

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-8 md:px-8 md:py-12">
      <PageHeader
        title={`Edit ${meta.title}`}
        meta={
          <Facts
            items={[
              ["File", <code className="font-mono text-[13px]">{meta.path}</code>],
              [
                "Status",
                isNew ? (
                  <Dot tone="off">New file</Dot>
                ) : dirty ? (
                  <Dot tone="warn" className="text-warn">Unsaved changes</Dot>
                ) : (
                  <Dot tone="good">In sync with main</Dot>
                ),
              ],
            ]}
          />
        }
        actions={
          <>
            {dirty && !isNew && (
              <Button
                variant="ghost"
                size="sm"
                disabled={!!drafting}
                onClick={() => {
                  // Discarding is one click, so it gets one click to take back.
                  const discarded = body
                  setFile(id, base ?? "")
                  setNotice(null)
                  const toastId = toast.add({
                    title: "Changes discarded",
                    description: `${meta.path} matches main again.`,
                    actionProps: {
                      children: "Undo",
                      onClick: () => {
                        setFile(id, discarded)
                        toast.close(toastId)
                      },
                    },
                  })
                }}
              >
                Discard
              </Button>
            )}
            <Button size="sm" disabled={!dirty || !!drafting} onClick={() => setCommitOpen(true)}>
              <GitBranchIcon />
              Commit
            </Button>
          </>
        }
      />

      {/* Writing assistant, running on the workspace owner's own key */}
      <section className="mt-10 rounded-xl border">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b px-4 py-3">
          <h2 className="text-[15px] font-semibold">Writing assistant</h2>
          <p className="text-sm text-muted-foreground">
            {ai.editor ? `${model} on your ${ai.provider === "anthropic" ? "Anthropic" : ai.provider} key` : "Turned off in Settings"}
          </p>
        </div>
        <div className="grid gap-4 p-4">
          {open.length > 0 && ai.editor ? (
            <ul className="-mt-3 divide-y">
              {open.map((q) => (
                <li key={q.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <p className="text-[15px]">
                    {q.text}
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      Agents asked {q.count} times
                      {inReview.includes(q.id) && <span className="text-warn">, answer in review</span>}
                    </span>
                  </p>
                  {drafted.includes(q.id) && drafting !== q.id ? (
                    <span className="flex shrink-0 items-center gap-1.5 text-sm text-good">
                      <CheckIcon className="size-4" />
                      Drafted below. Commit to publish it.
                    </span>
                  ) : (
                    <Button size="sm" variant={pending?.id === q.id ? "default" : "outline"} disabled={!!drafting} onClick={() => runDraft(q.id)} className="shrink-0 self-start sm:self-auto">
                      {drafting === q.id && <Spinner />}
                      {drafting === q.id ? "Drafting" : "Draft the answer"}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            ai.editor && <p className="text-sm text-muted-foreground">No open agent questions point at this page.</p>
          )}
          {ai.editor && (
            <InputGroup>
              <InputGroupInput
                placeholder="Describe what to write, like rules for a loading state"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && prompt.trim() && submitPrompt()}
                disabled={!!drafting}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="sm" variant="secondary" disabled={!!drafting} onClick={() => prompt.trim() && submitPrompt()}>
                  Draft
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          {!ai.editor && (
            <Button variant="outline" size="sm" className="justify-self-start" onClick={() => navigate("workspace")}>
              Open AI settings
            </Button>
          )}
        </div>
      </section>

      {notice && (
        <div className="mt-3 flex flex-col gap-2 rounded-lg bg-good-soft px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            Drafted {notice.lines} lines with {model}. Review the wording, then commit to answer every agent that asks.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="self-start sm:self-auto"
            onClick={() => {
              setFile(id, notice.before)
              setNotice(null)
            }}
          >
            <Undo2Icon />
            Undo draft
          </Button>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <SegmentedControl
          value={effective}
          onChange={(v) => {
            // Preview unmounts the source, and its caret with it.
            if (v === "preview") placed.current = false
            setMode(v as typeof mode)
          }}
          aria-label="Editor view"
          options={[
            { value: "write", label: "Write" },
            { value: "preview", label: "Preview" },
            { value: "split", label: "Split", className: "hidden lg:inline-flex" },
          ]}
        />
        {effective !== "preview" && (
          <div className="flex items-center gap-0.5 rounded-lg border p-0.5" role="toolbar" aria-label="Insert">
            {SNIPPETS.map((s) => (
              <Tooltip key={s.label}>
                <TooltipTrigger
                  render={<Button variant="ghost" size="icon-sm" aria-label={`Insert ${s.label.toLowerCase()}`} disabled={!!drafting} onClick={() => insert(s.text)} />}
                >
                  <s.icon />
                </TooltipTrigger>
                <TooltipContent>{s.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}
        <p className="ml-auto text-xs text-muted-foreground tabular">
          {body.split("\n").length} lines
          {dirty && !isNew && (
            <>
              , <span className="text-good">+{stats.added}</span> <span className="text-bad">−{stats.removed}</span>
            </>
          )}
        </p>
      </div>

      <div className={cn("mt-3 grid gap-4", effective === "split" && "grid-cols-2")}>
        {effective !== "preview" && (
          <Textarea
            ref={area}
            value={body}
            readOnly={!!drafting}
            onChange={(e) => setFile(id, e.target.value)}
            onFocus={() => (placed.current = true)}
            spellCheck={false}
            aria-label={`${meta.path} source`}
            className="h-[62svh] min-h-80 resize-none rounded-xl bg-card p-4 font-mono text-[13px] leading-6 field-sizing-fixed md:text-[13px] lg:h-[calc(100svh-22rem)]"
          />
        )}
        {effective !== "write" && (
          <div className="h-[62svh] min-h-80 overflow-auto rounded-xl border p-5 lg:h-[calc(100svh-22rem)]">
            <MdxPeople body={body} className="max-w-none" />
          </div>
        )}
      </div>

      <Dialog open={commitOpen} onOpenChange={setCommitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Commit changes</DialogTitle>
            <DialogDescription>Commits go to {`charged-labs/charged-ui`}. The site and agent context rebuild from main.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 font-mono text-xs">
            <span className="truncate">{meta.path}</span>
            <span className="shrink-0 tabular">
              <span className="text-good">+{stats.added}</span> <span className="text-bad">−{stats.removed}</span>
            </span>
          </div>
          {answersIn(id, body).filter((q) => !resolved.includes(q.id)).map((q) => (
            <p key={q.id} className="flex gap-2 text-sm text-muted-foreground">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-good" />
              Answers “{q.text}”
            </p>
          ))}
          <div className="grid gap-1.5">
            <Label htmlFor="commit-message">Message</Label>
            <Input id="commit-message" value={message} placeholder={`Update ${meta.title}`} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <RadioGroup value={target} onValueChange={(v) => setTarget(v as typeof target)} aria-label="Where to commit">
            {(
              [
                ["main", GitBranchIcon, "Commit to main", "Updates the site and every agent right away."],
                ["pr", GitPullRequestIcon, "Open a pull request", "Someone reviews it on GitHub first."],
              ] as const
            ).map(([value, Icon, title, note]) => (
              <FieldLabel key={value} htmlFor={`commit-${value}`}>
                <Field orientation="horizontal">
                  <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <FieldContent>
                    <FieldTitle>{title}</FieldTitle>
                    <FieldDescription className="text-xs">{note}</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value={value} id={`commit-${value}`} />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommitOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doCommit}>{target === "main" ? "Commit and push" : "Open pull request"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
