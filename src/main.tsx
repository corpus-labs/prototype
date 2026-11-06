import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "@/App";
import favicon from "@/assets/corpus-mark.svg";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/lib/store";

// Added here, not in index.html, because Vite inlines assets imported from code
// but leaves an HTML icon link as a separate file, which the single-file build can't carry.
const icon = document.createElement("link");
icon.rel = "icon";
icon.type = "image/svg+xml";
icon.href = favicon;
document.head.append(icon);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <TooltipProvider delay={300}>
        <Toaster viewportClassName="bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-4">
          <App />
        </Toaster>
      </TooltipProvider>
    </StoreProvider>
  </StrictMode>,
);
