import * as React from "react";

// Views are plain #names (letters, digits, hyphens) so links into the page
// survive being shared.
// With more than one project, Corpus opens on the projects dashboard.
const DEFAULT = "projects";

function current() {
  const h = window.location.hash.replace(/^#/, "");
  return /^[a-z0-9-]+$/i.test(h) ? h : DEFAULT;
}

export function useRoute() {
  const [route, setRoute] = React.useState(current);
  React.useEffect(() => {
    const on = () => {
      setRoute(current());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export function navigate(route: string) {
  if (current() === route) {
    window.scrollTo({ top: 0 });
    return;
  }
  window.location.hash = route;
}

export function href(route: string) {
  return `#${route}`;
}
