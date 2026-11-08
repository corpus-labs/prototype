import { useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { CONFIG, JOBS, type JobId } from "./config";
import { cn } from "./lib/utils";
import { Dot } from "./ui";
import { visit, write } from "./visit";

/* The waitlist, shared by every form on the page --------------------------- */

type Pay = "yes" | "maybe" | "no";

type State = {
  email: string | null;
  /** Which form the visitor used, so the follow-up questions show only there. */
  from: string | null;
  pay: Pay | null;
  first: JobId | null;
};

function load(): State {
  try {
    const saved = JSON.parse(window.localStorage.getItem("corpus.waitlist") ?? "null");
    if (saved && typeof saved.email === "string")
      return { email: saved.email, from: null, pay: saved.pay ?? null, first: saved.first ?? null };
  } catch {
    // Storage blocked or malformed: start fresh.
  }
  return { email: null, from: null, pay: null, first: null };
}

let state: State = load();
const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  write(
    "corpus.waitlist",
    JSON.stringify({ email: state.email, pay: state.pay, first: state.first }),
  );
  listeners.forEach((l) => l());
}

function useWaitlist() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

/**
 * Sends one record to the waitlist endpoint as form fields. Every record
 * carries the email, so a signup and its later answers join up in the export.
 */
async function send(fields: Record<string, string>) {
  const record: Record<string, string> = {
    price_shown: String(visit.price),
    ad_job: visit.job ?? "",
    referrer: visit.referrer ?? "",
    ...visit.utm,
    ...fields,
  };
  if (!CONFIG.waitlistEndpoint) {
    // Preview mode: keep it in this browser so the flow can be tried end to end.
    try {
      const list = JSON.parse(window.localStorage.getItem("corpus.waitlist.preview") ?? "[]");
      list.push({ ...record, at: new Date().toISOString() });
      window.localStorage.setItem("corpus.waitlist.preview", JSON.stringify(list));
    } catch {
      // Storage blocked: nothing to keep.
    }
    await new Promise((r) => setTimeout(r, 500));
    return;
  }
  const res = await fetch(CONFIG.waitlistEndpoint, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new URLSearchParams(record),
  });
  if (!res.ok) throw new Error(`Waitlist endpoint answered ${res.status}`);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* The form ----------------------------------------------------------------- */

export function WaitlistForm({ id, className }: { id: string; className?: string }) {
  const s = useWaitlist();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (s.email) {
    return s.from === id ? (
      <FollowUp className={className} />
    ) : (
      <p className={cn("text-[16px]", className)}>
        <Dot tone="good">
          <span>
            You’re on the list as <span className="font-medium">{s.email}</span>.
          </span>
        </Dot>
      </p>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setError("Enter an email address, like you@company.com.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      await send({ email: value, form: id });
      set({ email: value, from: id });
    } catch {
      setError("That didn’t go through. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form className={className} onSubmit={submit} noValidate>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor={`email-${id}`} className="sr-only">
          Work email
        </label>
        <input
          id={`email-${id}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={`email-${id}-note`}
          className="h-12 w-full min-w-0 rounded-xl border sm:w-auto sm:flex-1 bg-white px-4 text-[16px] shadow-xs transition outline-none placeholder:text-faint focus:border-neutral-400 focus:ring-4 focus:ring-neutral-200 aria-invalid:border-bad"
        />
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-[15.5px] font-medium text-white transition hover:bg-neutral-800 focus-visible:ring-4 focus-visible:ring-neutral-300 focus-visible:outline-none disabled:opacity-70"
        >
          {sending && (
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          {sending ? "Joining" : "Join the waitlist"}
        </button>
      </div>
      <p
        id={`email-${id}-note`}
        className={cn("mt-3 text-[14px]", error ? "text-bad" : "text-muted")}
        aria-live="polite"
      >
        {error ?? `One email when the private beta opens in ${CONFIG.betaOpens}. No spam.`}
      </p>
    </form>
  );
}

/* After signing up: two quick questions for the demand test ------------------ */

const PAY: [Pay, string][] = [
  ["yes", "Yes"],
  ["maybe", "Maybe"],
  ["no", "Not at that price"],
];

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "h-9 rounded-lg border px-3.5 text-[14.5px] transition focus-visible:ring-4 focus-visible:ring-neutral-200 focus-visible:outline-none",
        selected
          ? "border-ink bg-ink text-white"
          : "bg-white hover:border-neutral-300 hover:bg-subtle",
      )}
    >
      {children}
    </button>
  );
}

function FollowUp({ className }: { className?: string }) {
  const s = useWaitlist();
  const answer = (fields: Record<string, string>) => {
    // Answers are a bonus. If one fails to send, the signup already counted.
    send({ email: s.email ?? "", ...fields }).catch(() => {});
  };
  return (
    <div className={cn("rounded-2xl border bg-subtle p-5 sm:p-6", className)} aria-live="polite">
      <Dot tone="good" className="text-[16px] font-medium">
        You’re on the list
      </Dot>
      <p className="mt-1 pl-4 text-[14.5px] text-pretty text-muted">
        We’ll write to {s.email} when the beta opens. Two quick questions help decide what ships
        first.
      </p>

      <fieldset className="mt-5 border-t pt-4">
        <legend className="sr-only">Price</legend>
        <p className="text-[15px] font-medium">
          Would your team pay ${visit.price} once for Corpus?
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {PAY.map(([v, label]) => (
            <Choice
              key={v}
              selected={s.pay === v}
              onClick={() => {
                set({ pay: v });
                answer({ would_pay: v });
              }}
            >
              {label}
            </Choice>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="sr-only">First use</legend>
        <p className="text-[15px] font-medium">What would you use it for first?</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {(Object.keys(JOBS) as JobId[]).map((j) => (
            <Choice
              key={j}
              selected={s.first === j}
              onClick={() => {
                set({ first: j });
                answer({ first_job: j });
              }}
            >
              {JOBS[j].label}
            </Choice>
          ))}
        </div>
      </fieldset>

      {s.pay && s.first && (
        <p className="mt-5 text-[14.5px] text-muted">Thanks. That shapes what gets built first.</p>
      )}
    </div>
  );
}

/** Shown while no endpoint is set, so the page can't go live losing signups. */
export function PreviewNotice() {
  if (CONFIG.waitlistEndpoint) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-300 bg-amber-50 px-5 py-2.5 text-center text-[13.5px] text-amber-900">
      Preview: signups stay in this browser until a waitlist endpoint is set in{" "}
      <code className="font-mono text-[12.5px]">landing/src/config.ts</code>.
    </div>
  );
}
