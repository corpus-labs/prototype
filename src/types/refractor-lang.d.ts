// Refractor's wildcard export ("./*" -> "./lang/*.js") carries no types
// condition, so TypeScript can't find the declarations beside each language.
// Every language module is the same shape: a syntax function with a display
// name attached.
declare module "refractor/*" {
  import type { Syntax } from "refractor/core";
  const language: Syntax;
  export default language;
}
