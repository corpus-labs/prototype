import * as React from "react";

// Views are plain #names (letters, digits, hyphens) so links into the page
// survive being shared.
// With more than one project, Corpus opens on the projects dashboard.
const DEFAULT = "projects";

/** Back to the top of the page: the window on phones, the content panel on desktop. */
export function toTop() {
  window.scrollTo({ top: 0 });
  document.querySelector<HTMLElement>("[data-scroll-root]")?.scrollTo({ top: 0 });
}

function current() {
  const h = window.location.hash.replace(/^#/, "");
  return /^[a-z0-9-]+$/i.test(h) ? h : DEFAULT;
}

export function useRoute() {
  const [route, setRoute] = React.useState(current);
  React.useEffect(() => {
    const on = () => {
      setRoute(current());
      toTop();
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export function navigate(route: string) {
  if (current() === route) {
    toTop();
    return;
  }
  window.location.hash = route;
}

export function href(route: string) {
  return `#${route}`;
}
