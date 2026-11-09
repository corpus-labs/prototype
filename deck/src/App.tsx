import { useCallback, useEffect, useState } from "react";
import { SLIDES } from "./slides";
import { Lattice, SlideIndex } from "./ui";

const TOTAL = SLIDES.length;
/** Content slides: everything but the cover and the close. */
const PAGES = TOTAL - 2;
/** What the page controls show: "Cover", "Summary", or a content slide's number. */
const pageLabel = (i: number) =>
  i === 0 ? "Cover" : i === TOTAL - 1 ? "Summary" : `${i} of ${PAGES}`;
const W = 1280;
const H = 720;

type View = { mode: "present" | "all"; i: number };

/** `#4` opens slide 4, `#all` shows every slide in one scrolling column. */
function readHash(): View {
  const h = window.location.hash.replace(/^#\/?/, "");
  if (h === "all") return { mode: "all", i: 0 };
  const n = Number.parseInt(h, 10);
  return { mode: "present", i: Number.isFinite(n) ? Math.min(Math.max(n, 1), TOTAL) - 1 : 0 };
}

function useZoom(mode: View["mode"]) {
  const fit = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return mode === "all" ? Math.min((vw - 48) / W, 1.25) : Math.min((vw - 48) / W, (vh - 88) / H);
  }, [mode]);
  const [zoom, setZoom] = useState(fit);
  useEffect(() => {
    const on = () => setZoom(fit());
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [fit]);
  return zoom;
}

export default function App() {
  const [view, setView] = useState<View>(readHash);
  const zoom = useZoom(view.mode);

  useEffect(() => {
    const on = () => setView(readHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const go = useCallback((i: number) => {
    const next = Math.min(Math.max(i, 0), TOTAL - 1);
    window.history.replaceState(null, "", `#${next + 1}`);
    setView({ mode: "present", i: next });
  }, []);

  const toggleAll = useCallback(() => {
    setView((v) => {
      const mode = v.mode === "all" ? "present" : "all";
      window.history.replaceState(null, "", mode === "all" ? "#all" : `#${v.i + 1}`);
      return { ...v, mode };
    });
  }, []);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === "g" || k === "Escape") {
        e.preventDefault();
        toggleAll();
        return;
      }
      if (view.mode !== "present") return;
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter", "j", "l"].includes(k)) {
        e.preventDefault();
        go(view.i + (e.shiftKey && k === " " ? -1 : 1));
      } else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace", "k", "h"].includes(k)) {
        e.preventDefault();
        go(view.i - 1);
      } else if (k === "Home") {
        go(0);
      } else if (k === "End") {
        go(TOTAL - 1);
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [view, go, toggleAll]);

  const onSlideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Links on a slide (like a cited source) open on their own, in either view.
    if ((e.target as HTMLElement).closest("a")) return;
    if (view.mode === "all") {
      const el = (e.target as HTMLElement).closest<HTMLElement>(".slide");
      if (el?.dataset.n) go(Number(el.dataset.n) - 1);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    go(view.i + (x < 0.3 ? -1 : 1));
  };

  return (
    <div className="stage" data-mode={view.mode}>
      {/* The landing page's lattice, fixed to the window and strongest at the top right. */}
      <div className="no-print pointer-events-none fixed inset-0 -z-10">
        <Lattice
          className="opacity-60"
          markClassName="fill-mist-300"
          fade="radial-gradient(ellipse 70% 120% at 100% 0%, black 0%, rgb(0 0 0 / 0.5) 40%, transparent 75%)"
        />
      </div>
      <div
        className="deck cursor-pointer select-none"
        data-mode={view.mode}
        style={{ "--zoom": zoom } as React.CSSProperties}
        onClick={onSlideClick}
      >
        {SLIDES.map((S, i) => (
          <SlideIndex.Provider key={i} value={{ n: i + 1, page: i, pages: PAGES }}>
            <SlideHost active={view.mode === "all" || i === view.i}>
              <S />
            </SlideHost>
          </SlideIndex.Provider>
        ))}
      </div>

      {view.mode === "present" && (
        <nav className="no-print row-start-3 flex items-center justify-center gap-1 self-stretch justify-self-stretch text-[13px] text-neutral-600">
          <NavButton label="Previous slide" onClick={() => go(view.i - 1)} disabled={view.i === 0}>
            <path d="M10 3 5 8l5 5" />
          </NavButton>
          <span className="w-16 text-center tabular-nums">{pageLabel(view.i)}</span>
          <NavButton
            label="Next slide"
            onClick={() => go(view.i + 1)}
            disabled={view.i === TOTAL - 1}
          >
            <path d="m6 3 5 5-5 5" />
          </NavButton>
          <button
            type="button"
            onClick={toggleAll}
            className="ml-3 rounded-md px-2.5 py-1.5 hover:bg-neutral-300/60"
          >
            Show all slides
          </button>
        </nav>
      )}
    </div>
  );
}

/** Marks the visible slide. In print every slide shows regardless. */
function SlideHost({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div className="contents" data-host={active ? "on" : "off"}>
      {children}
    </div>
  );
}

function NavButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-8 place-items-center rounded-md hover:bg-neutral-300/60 disabled:opacity-30"
    >
      <svg
        viewBox="0 0 16 16"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </button>
  );
}
