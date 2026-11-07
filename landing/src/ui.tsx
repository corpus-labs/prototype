import type { ReactNode } from "react";
import { cn } from "./lib/utils";

// The Corpus mark and wordmark, copied from the product (src/components/corpus-logo.tsx).
const MARK =
  "M0 24C0 10.7501 10.7501 0 24 0C24 13.2499 13.2499 24 0 24Z" +
  "M0 24C0 37.2499 10.7501 48 24 48C24 34.7501 13.2499 24 0 24Z" +
  "M48 24C48 10.7501 37.2499 0 24 0C24 13.2499 34.7501 24 48 24Z" +
  "M48 24C48 37.2499 37.2499 48 24 48C24 34.7501 34.7501 24 48 24Z";

const WORDMARK =
  "M75.856 41.768C72.752 41.768 70.016 41.064 67.648 39.656C65.28 38.216 63.424 36.184 62.08 33.56C60.736 30.904 60.064 27.72 60.064 24.008C60.064 20.36 60.72 17.208 62.032 14.552C63.344 11.864 65.184 9.8 67.552 8.36C69.92 6.888 72.704 6.152 75.904 6.152C80.256 6.152 83.632 7.24 86.032 9.416C88.432 11.56 90 14.568 90.736 18.44L84.208 18.776C83.792 16.536 82.896 14.776 81.52 13.496C80.144 12.216 78.272 11.576 75.904 11.576C73.984 11.576 72.32 12.088 70.912 13.112C69.504 14.136 68.416 15.576 67.648 17.432C66.88 19.288 66.496 21.48 66.496 24.008C66.496 26.568 66.88 28.776 67.648 30.632C68.448 32.456 69.552 33.864 70.96 34.856C72.368 35.848 74 36.344 75.856 36.344C78.384 36.344 80.336 35.656 81.712 34.28C83.12 32.872 84.016 30.952 84.4 28.52L90.928 28.856C90.48 31.512 89.616 33.816 88.336 35.768C87.056 37.688 85.36 39.176 83.248 40.232C81.168 41.256 78.704 41.768 75.856 41.768Z" +
  "M104.409 41.576C101.881 41.576 99.6565 41.032 97.7365 39.944C95.8485 38.824 94.3765 37.256 93.3205 35.24C92.2965 33.224 91.7845 30.872 91.7845 28.184C91.7845 25.464 92.2965 23.112 93.3205 21.128C94.3765 19.112 95.8485 17.56 97.7365 16.472C99.6565 15.352 101.881 14.792 104.409 14.792C106.937 14.792 109.145 15.352 111.033 16.472C112.921 17.56 114.377 19.112 115.401 21.128C116.457 23.112 116.985 25.464 116.985 28.184C116.985 30.872 116.457 33.224 115.401 35.24C114.377 37.256 112.921 38.824 111.033 39.944C109.145 41.032 106.937 41.576 104.409 41.576ZM104.409 36.584C106.393 36.584 107.913 35.848 108.969 34.376C110.057 32.904 110.601 30.84 110.601 28.184C110.601 25.56 110.057 23.512 108.969 22.04C107.913 20.536 106.393 19.784 104.409 19.784C102.424 19.784 100.889 20.536 99.8005 22.04C98.7125 23.512 98.1685 25.56 98.1685 28.184C98.1685 30.84 98.7125 32.904 99.8005 34.376C100.889 35.848 102.424 36.584 104.409 36.584Z" +
  "M119.326 41V15.368H125.086L125.326 22.472L124.798 22.376C125.182 19.912 125.902 18.136 126.958 17.048C128.046 15.928 129.518 15.368 131.374 15.368H133.726V20.648H131.326C130.014 20.648 128.926 20.84 128.062 21.224C127.198 21.608 126.542 22.216 126.094 23.048C125.678 23.848 125.47 24.904 125.47 26.216V41H119.326Z" +
  "M135.019 48.2V15.368H140.923L141.067 20.84L140.443 20.552C141.083 18.664 142.123 17.24 143.563 16.28C145.035 15.288 146.747 14.792 148.699 14.792C151.131 14.792 153.147 15.4 154.747 16.616C156.379 17.832 157.595 19.448 158.395 21.464C159.195 23.48 159.595 25.72 159.595 28.184C159.595 30.648 159.179 32.888 158.347 34.904C157.547 36.92 156.331 38.536 154.699 39.752C153.099 40.968 151.083 41.576 148.651 41.576C147.371 41.576 146.171 41.352 145.051 40.904C143.963 40.456 143.019 39.816 142.219 38.984C141.451 38.152 140.907 37.176 140.587 36.056L141.163 35.576V48.2H135.019ZM147.211 36.584C149.067 36.584 150.523 35.848 151.579 34.376C152.667 32.872 153.211 30.808 153.211 28.184C153.211 25.56 152.667 23.512 151.579 22.04C150.523 20.536 149.067 19.784 147.211 19.784C145.963 19.784 144.891 20.104 143.995 20.744C143.099 21.352 142.395 22.28 141.883 23.528C141.403 24.776 141.163 26.328 141.163 28.184C141.163 30.04 141.403 31.592 141.883 32.84C142.363 34.088 143.051 35.032 143.947 35.672C144.875 36.28 145.963 36.584 147.211 36.584Z" +
  "M170.411 41.576C167.819 41.576 165.755 40.728 164.219 39.032C162.715 37.304 161.963 34.92 161.963 31.88V15.368H168.107V30.344C168.107 32.488 168.459 34.072 169.163 35.096C169.899 36.088 171.003 36.584 172.475 36.584C174.139 36.584 175.419 36.04 176.315 34.952C177.243 33.832 177.707 32.216 177.707 30.104V15.368H183.851V41H178.235L178.091 33.944L178.859 34.184C178.475 36.616 177.563 38.456 176.123 39.704C174.683 40.952 172.779 41.576 170.411 41.576Z" +
  "M198.151 41.576C195.623 41.576 193.495 41.208 191.767 40.472C190.071 39.736 188.759 38.712 187.831 37.4C186.903 36.088 186.375 34.6 186.247 32.936L192.535 32.648C192.759 33.992 193.319 35.032 194.215 35.768C195.111 36.504 196.439 36.872 198.199 36.872C199.639 36.872 200.759 36.648 201.559 36.2C202.391 35.72 202.807 34.984 202.807 33.992C202.807 33.416 202.663 32.936 202.375 32.552C202.087 32.168 201.543 31.832 200.743 31.544C199.943 31.256 198.759 30.968 197.191 30.68C194.567 30.232 192.503 29.688 190.999 29.048C189.495 28.376 188.423 27.544 187.783 26.552C187.175 25.56 186.871 24.328 186.871 22.856C186.871 20.456 187.783 18.52 189.607 17.048C191.463 15.544 194.167 14.792 197.719 14.792C200.023 14.792 201.959 15.176 203.527 15.944C205.095 16.68 206.311 17.704 207.175 19.016C208.071 20.296 208.631 21.768 208.855 23.432L202.663 23.72C202.503 22.856 202.215 22.104 201.799 21.464C201.383 20.824 200.823 20.344 200.119 20.024C199.415 19.672 198.583 19.496 197.623 19.496C196.183 19.496 195.095 19.784 194.359 20.36C193.623 20.936 193.255 21.704 193.255 22.664C193.255 23.336 193.415 23.896 193.735 24.344C194.087 24.792 194.647 25.16 195.415 25.448C196.183 25.704 197.207 25.944 198.487 26.168C201.175 26.584 203.287 27.128 204.823 27.8C206.391 28.44 207.495 29.272 208.135 30.296C208.807 31.288 209.143 32.488 209.143 33.896C209.143 35.528 208.679 36.92 207.751 38.072C206.855 39.224 205.575 40.104 203.911 40.712C202.279 41.288 200.359 41.576 198.151 41.576Z";

export function CorpusMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={cn("shrink-0", className)} aria-hidden>
      <path fillRule="evenodd" d={MARK} />
    </svg>
  );
}

export function CorpusLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 212 49"
      fill="currentColor"
      className={cn("w-auto shrink-0", className)}
      role="img"
      aria-label="Corpus"
    >
      <path fillRule="evenodd" d={MARK} />
      <path d={WORDMARK} />
    </svg>
  );
}

const DOT = {
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
  off: "bg-neutral-300",
} as const;

/** The product's status dot: a small circle, then the words. */
export function Dot({
  tone,
  children,
  className,
}: {
  tone: keyof typeof DOT;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("size-2 shrink-0 rounded-full", DOT[tone])} />
      {children}
    </span>
  );
}

/** A product screenshot, framed the way the product frames previews. */
export function Shot({
  src,
  alt,
  className,
  imgClassName,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  width: number;
  height: number;
}) {
  return (
    <div className={cn("shot overflow-hidden bg-white", className)}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={cn("block h-auto w-full", imgClassName)}
      />
    </div>
  );
}

/** Section heading and lead, in the product's type scale. */
export function Heading({
  title,
  lead,
  className,
}: {
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-[760px]", className)}>
      <h2 className="text-[30px] leading-[1.12] font-semibold tracking-[-0.03em] text-balance sm:text-[40px]">
        {title}
      </h2>
      {lead && (
        <p className="mt-4 text-[17px] leading-[1.55] text-pretty text-muted sm:text-[19px]">
          {lead}
        </p>
      )}
    </div>
  );
}

/** A 14px stroke icon for the browser toolbar, in the style of the rest of the page. */
function ToolbarIcon({ d, className }: { d: string[]; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-3.5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {d.map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

const ICON = {
  back: ["m12 19-7-7 7-7", "M19 12H5"],
  forward: ["M5 12h14", "m12 5 7 7-7 7"],
  reload: ["M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8", "M21 3v5h-5"],
  copy: [
    "M8 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z",
    "M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2",
  ],
};

/**
 * The product in a browser window, after Geist's Browser component: window
 * buttons and history controls on the left, a pill address bar in the middle,
 * and the screenshot below. The screenshot already shows the app's tinted
 * canvas and white panel.
 */
export function AppWindow({
  src,
  alt,
  width,
  height,
  address,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  address: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] bg-neutral-50 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_2px_2px_rgb(0_0_0/0.04),0_32px_64px_-24px_rgb(0_0_0/0.18)]",
        className,
      )}
    >
      <div className="flex items-center gap-4 border-b border-black/[0.06] bg-white px-4 py-2 md:gap-6 md:px-5 md:py-2.5">
        <div className="flex flex-1 items-center gap-4">
          <span className="flex gap-2" aria-hidden>
            <span className="size-3 rounded-full bg-[#FE5F57]" />
            <span className="size-3 rounded-full bg-[#FEBB2E]" />
            <span className="size-3 rounded-full bg-[#26C941]" />
          </span>
          <span className="hidden items-center gap-4 text-neutral-500 md:flex">
            <ToolbarIcon d={ICON.back} />
            <ToolbarIcon d={ICON.forward} className="opacity-40" />
            <ToolbarIcon d={ICON.reload} />
          </span>
        </div>
        <div className="flex min-w-0 flex-[2] justify-center md:flex-1">
          <span className="flex h-[34px] w-full max-w-xs items-center rounded-full border border-neutral-200 bg-neutral-50 pr-2.5 pl-4 text-[13px]">
            <span className="min-w-0 flex-1 truncate text-center text-neutral-900">{address}</span>
            <ToolbarIcon d={ICON.copy} className="size-3 text-neutral-500" />
          </span>
        </div>
        <div className="hidden flex-1 md:block" />
      </div>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        decoding="async"
        className="block h-auto w-full"
      />
    </div>
  );
}
