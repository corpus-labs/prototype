import { Printer } from "lucide-react";
import { Button } from "./components/ui/button";
import { CorpusMark } from "./ui";
import { SLIDES } from "./slides";

export default function App() {
  return (
    <div className="min-h-screen py-8">
      <header className="no-print deck mb-8 flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <CorpusMark className="size-5 text-neutral-900" />
          <span className="text-[15px] font-medium">Corpus</span>
          <span className="font-mono text-[11px] tracking-[0.14em] text-neutral-400 uppercase">
            · IYA Ignite Grant · Fall 2026
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-[11px] text-neutral-400 md:block">
            print → save as PDF · landscape · backgrounds on
          </span>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer data-icon="inline-start" />
            Print / Save as PDF
          </Button>
        </div>
      </header>
      <main className="deck">
        {SLIDES.map((Slide, i) => (
          <Slide key={i} />
        ))}
      </main>
      <footer className="no-print deck mt-4 flex justify-between px-1 font-mono text-[11px] text-neutral-400">
        <span>10 slides · 16:9 · built with the product&rsquo;s own stack</span>
        <span>react 19 · tailwind 4 · base ui · geist</span>
      </footer>
    </div>
  );
}
