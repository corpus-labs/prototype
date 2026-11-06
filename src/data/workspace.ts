// Sample content for the prototype. The workspace documents Charged UI,
// the first design system planned to live in Corpus.
import { handbookPages } from "@/data/handbook-pages";

export type Status = "stable" | "beta" | "deprecated";
export type Source = "sdc" | "block" | "storybook";

export type PropDef = {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  description: string;
};

export type ExamplePair = {
  key: string;
  do: { title: string; caption: string; preview: string; code: string };
  dont: { title: string; caption: string; preview: string; code: string };
  rule: string;
};

export type ComponentDoc = {
  id: string;
  name: string;
  status: Status;
  source: Source;
  machine: string;
  file: string;
  category: "Actions" | "Content" | "Feedback" | "Navigation" | "Forms" | "Layout";
  summary: string;
  props: PropDef[];
  slots?: { name: string; description: string }[];
  whenToUse?: string[];
  whenNotToUse?: string[];
  agentRules?: { key: "usage" | "a11y"; text: string }[];
  examples?: ExamplePair[];
  a11y?: string[];
  tokens?: string[];
  related?: string[];
  requests: number;
  updated: string;
  replacedBy?: string;
};

export const workspace = {
  name: "Charged UI",
  description: "Component library for Drupal sites, shipped as single directory components.",
  site: "docs.charged.dev",
  repo: "charged-labs/charged-ui",
  branch: "main",
  mcp: "https://docs.charged.dev/mcp",
  llms: "https://docs.charged.dev/llms.txt",
};

export const components: ComponentDoc[] = [
  {
    id: "button",
    name: "Button",
    status: "stable",
    source: "sdc",
    machine: "charged_ui:button",
    file: "components/button/button.component.yml",
    category: "Actions",
    summary:
      "Starts an action or moves someone to the next step of a flow. Use one primary button per view.",
    props: [
      {
        name: "label",
        type: "string",
        required: true,
        description: "Verb first, sentence case, three words or fewer.",
      },
      {
        name: "variant",
        type: "primary | secondary | ghost | danger",
        default: "secondary",
        description: "Primary is for the one action that completes the view.",
      },
      {
        name: "size",
        type: "sm | md | lg",
        default: "md",
        description: "Use md or lg on touch screens.",
      },
      {
        name: "href",
        type: "uri",
        description: "Renders a link with button styling. Use it when the action navigates.",
      },
      { name: "icon", type: "icon name", description: "Optional icon from the Charged icon set." },
      {
        name: "icon_position",
        type: "start | end",
        default: "start",
        description: "Put the icon after the label only for directional actions.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "Explain nearby why the action is unavailable.",
      },
      {
        name: "loading",
        type: "boolean",
        default: "false",
        description: "Shows a spinner and blocks repeat clicks.",
      },
    ],
    whenToUse: [
      "To start an action in place, like saving, sending, or deleting.",
      "To move someone to the next step of a flow. Pass href and it renders a link.",
    ],
    whenNotToUse: [
      "For navigation inside running text. Use a text link.",
      "To switch a setting on or off. Use Switch.",
    ],
    agentRules: [
      { key: "usage", text: "SHOULD use variant ghost inside toolbars and table rows." },
      { key: "usage", text: "MUST NOT use Button to toggle a setting. Use Switch." },
      { key: "a11y", text: "MUST give icon-only buttons an aria_label." },
      { key: "a11y", text: "MUST NOT remove the focus ring." },
    ],
    examples: [
      {
        key: "primary",
        rule: "MUST NOT place more than one variant primary in the same view.",
        do: {
          title: "One primary action",
          caption: "Pair one primary button with a secondary one.",
          preview: "pair-good",
          code: "{{ include('charged_ui:button', { variant: 'primary', label: 'Save changes' }) }}\n{{ include('charged_ui:button', { label: 'Cancel' }) }}",
        },
        dont: {
          title: "Competing primaries",
          caption: "Two primary buttons fight for the same click.",
          preview: "pair-bad",
          code: "{{ include('charged_ui:button', { variant: 'primary', label: 'Save' }) }}\n{{ include('charged_ui:button', { variant: 'primary', label: 'Publish' }) }}",
        },
      },
      {
        key: "labels",
        rule: "MUST write labels as a verb phrase in sentence case, three words or fewer.",
        do: {
          title: "Say what happens",
          caption: "Start with a verb that names the result.",
          preview: "label-good",
          code: "{{ include('charged_ui:button', { variant: 'primary', label: 'Invite people' }) }}",
        },
        dont: {
          title: "Vague labels",
          caption: "“Click here” and “Submit” say nothing about the result.",
          preview: "label-bad",
          code: "{{ include('charged_ui:button', { variant: 'primary', label: 'Click here' }) }}",
        },
      },
      {
        key: "links",
        rule: "MUST pass href to Button for links styled as buttons. NEVER style a raw <a> with button classes.",
        do: {
          title: "Use href",
          caption: "Button renders the link and keeps focus and sizing.",
          preview: "link-good",
          code: "{{ include('charged_ui:button', { label: 'Read the guide', href: '/guide' }) }}",
        },
        dont: {
          title: "Raw anchors",
          caption: "Hand-styled anchors drift from the component.",
          preview: "link-bad",
          code: '<a class="btn btn-primary" href="/guide">Read the guide</a>',
        },
      },
    ],
    a11y: [
      "Give icon-only buttons an aria_label. The icon alone isn’t announced.",
      "Never remove the focus ring. It uses color.focus.",
      "Use disabled sparingly, and say nearby why the action is unavailable.",
      "Sizes md and lg meet the 40px touch target. Use sm only with a pointer.",
    ],
    tokens: [
      "color.action.primary",
      "color.action.primary-hover",
      "color.focus",
      "radius.control",
      "space.control-x",
      "font.label",
    ],
    related: ["link", "menu", "form-field"],
    requests: 312,
    updated: "3 days ago",
  },
  {
    id: "card",
    name: "Card",
    status: "stable",
    source: "sdc",
    machine: "charged_ui:card",
    file: "components/card/card.component.yml",
    category: "Content",
    summary: "Groups content and actions about a single subject, like an article or a program.",
    props: [
      {
        name: "title",
        type: "string",
        required: true,
        description: "Becomes the link text when href is set.",
      },
      { name: "href", type: "uri", description: "Makes the whole card a link." },
      {
        name: "variant",
        type: "outline | elevated | plain",
        default: "outline",
        description: "Elevated is for cards that float over imagery.",
      },
      { name: "media", type: "image", description: "Optional image above the title." },
    ],
    slots: [
      { name: "body", description: "Short description. Two or three lines." },
      { name: "footer", description: "Metadata or one secondary action." },
    ],
    whenToUse: [
      "To show a set of comparable items, like articles or programs, in a grid.",
      "To link to a detail page with a short preview.",
    ],
    whenNotToUse: ["For a single block of text. Use a section with a heading."],
    agentRules: [
      { key: "usage", text: "SHOULD use Card only inside a grid of comparable items." },
      { key: "a11y", text: "MUST NOT add a second link inside a card that has href." },
    ],
    a11y: [
      "When href is set, the title is the link text. Don’t add a second link inside the card.",
    ],
    tokens: ["radius.card", "color.line", "space.6"],
    related: ["hero", "badge"],
    requests: 148,
    updated: "1 week ago",
  },
  {
    id: "callout",
    name: "Callout",
    status: "stable",
    source: "sdc",
    machine: "charged_ui:callout",
    file: "components/callout/callout.component.yml",
    category: "Feedback",
    summary: "Draws attention to information that changes what someone does next.",
    props: [
      {
        name: "tone",
        type: "info | success | warning | danger",
        default: "info",
        description: "Match the tone to the consequence, not to decoration.",
      },
      { name: "title", type: "string", description: "Name the consequence in a few words." },
      {
        name: "dismissible",
        type: "boolean",
        default: "false",
        description: "Only for tips that never return once dismissed.",
      },
    ],
    slots: [{ name: "body", description: "One or two sentences." }],
    whenToUse: [
      "To warn about a consequence before someone acts.",
      "To confirm that something worked when the page doesn’t change.",
    ],
    whenNotToUse: ["For general page introductions. Use body text."],
    agentRules: [
      { key: "a11y", text: "MUST use role=alert only for callouts that appear after an action." },
    ],
    examples: [
      {
        key: "stacking",
        rule: "MUST NOT stack more than one callout in a section.",
        do: {
          title: "One per section",
          caption: "Put the consequence in the title.",
          preview: "callout-good",
          code: "{{ include('charged_ui:callout', { tone: 'warning', title: 'Deleting removes all versions' }) }}",
        },
        dont: {
          title: "Stacked callouts",
          caption: "Three in a row read as noise.",
          preview: "callout-bad",
          code: "{# three callouts in a row #}",
        },
      },
    ],
    a11y: ["Warning and danger callouts use role=alert only when they appear after an action."],
    tokens: ["color.status.warning", "color.action.soft", "radius.control"],
    related: ["badge"],
    requests: 96,
    updated: "Yesterday",
  },
  {
    id: "form-field",
    name: "Form field",
    status: "stable",
    source: "sdc",
    machine: "charged_ui:form_field",
    file: "components/form-field/form-field.component.yml",
    category: "Forms",
    summary: "A labeled input with help text and validation.",
    props: [
      {
        name: "label",
        type: "string",
        required: true,
        description: "Always visible. Never use the placeholder as the label.",
      },
      {
        name: "type",
        type: "text | email | password | number",
        default: "text",
        description: "Matches the input type.",
      },
      { name: "help", type: "string", description: "Format hints, shown under the input." },
      { name: "error", type: "string", description: "Says what happened and how to fix it." },
      {
        name: "required",
        type: "boolean",
        default: "false",
        description: "Marks the label, not the placeholder.",
      },
    ],
    whenToUse: ["For every text input in a form."],
    agentRules: [{ key: "usage", text: "MUST stack form fields with space.4." }],
    examples: [
      {
        key: "labels",
        rule: "MUST NOT use the placeholder as the only label.",
        do: {
          title: "Visible label",
          caption: "The label stays put while typing.",
          preview: "field-good",
          code: "{{ include('charged_ui:form_field', { label: 'Email', type: 'email' }) }}",
        },
        dont: {
          title: "Placeholder as label",
          caption: "It disappears as soon as someone types.",
          preview: "field-bad",
          code: '<input placeholder="Email">',
        },
      },
    ],
    a11y: ["Errors are linked with aria-describedby and announced on submit."],
    tokens: ["space.4", "radius.control", "color.line"],
    requests: 88,
    updated: "2 weeks ago",
  },
  {
    id: "menu",
    name: "Menu",
    status: "stable",
    source: "sdc",
    machine: "charged_ui:menu",
    file: "components/menu/menu.component.yml",
    category: "Navigation",
    summary: "Site navigation where each item is its own page.",
    props: [
      {
        name: "items",
        type: "menu tree",
        required: true,
        description: "Passed from a Drupal menu.",
      },
      {
        name: "orientation",
        type: "horizontal | vertical",
        default: "horizontal",
        description: "Vertical inside sidebars.",
      },
      {
        name: "active_trail",
        type: "boolean",
        default: "true",
        description: "Marks the current page.",
      },
    ],
    whenToUse: ["For links between pages that each have their own URL."],
    whenNotToUse: ["To switch views on one page. Use Tabs."],
    examples: [
      {
        key: "active",
        rule: "MUST NOT mark a parent and a child active at the same time.",
        do: {
          title: "One active item",
          caption: "The current page is the only one marked.",
          preview: "menu-good",
          code: "{{ include('charged_ui:menu', { items: menu }) }}",
        },
        dont: {
          title: "Two active items",
          caption: "Readers can’t tell where they are.",
          preview: "menu-bad",
          code: "{# parent and child both active #}",
        },
      },
    ],
    a11y: ["The current page gets aria-current=page."],
    tokens: ["font.label", "color.action.primary"],
    related: ["tabs", "breadcrumb"],
    requests: 74,
    updated: "2 weeks ago",
  },
  {
    id: "tabs",
    name: "Tabs",
    status: "beta",
    source: "sdc",
    machine: "charged_ui:tabs",
    file: "components/tabs/tabs.component.yml",
    category: "Navigation",
    summary: "Switches between views of the same content without leaving the page.",
    props: [
      {
        name: "items",
        type: "array<{ label, panel }>",
        required: true,
        description: "Two to six tabs.",
      },
      {
        name: "selected",
        type: "integer",
        default: "0",
        description: "Index of the tab shown first.",
      },
    ],
    requests: 61,
    updated: "3 weeks ago",
    related: ["menu"],
  },
  {
    id: "badge",
    name: "Badge",
    status: "stable",
    source: "sdc",
    machine: "charged_ui:badge",
    file: "components/badge/badge.component.yml",
    category: "Content",
    summary: "A short status or category label.",
    props: [
      { name: "label", type: "string", required: true, description: "One or two words." },
      {
        name: "tone",
        type: "neutral | info | success | warning | danger",
        default: "neutral",
        description: "Use tone for status, not decoration.",
      },
    ],
    whenToUse: ["To show status or category next to a title."],
    agentRules: [{ key: "usage", text: "SHOULD keep badge labels to one or two words." }],
    requests: 41,
    updated: "1 month ago",
  },
  {
    id: "accordion",
    name: "Accordion",
    status: "beta",
    source: "sdc",
    machine: "charged_ui:accordion",
    file: "components/accordion/accordion.component.yml",
    category: "Content",
    summary: "Stacked sections that expand to show more detail.",
    props: [
      {
        name: "items",
        type: "array<{ heading, body }>",
        required: true,
        description: "Each heading should make sense on its own.",
      },
      {
        name: "multiple",
        type: "boolean",
        default: "false",
        description: "Allows more than one open section.",
      },
    ],
    requests: 33,
    updated: "1 month ago",
  },
  {
    id: "hero",
    name: "Hero",
    status: "beta",
    source: "sdc",
    machine: "charged_ui:hero",
    file: "components/hero/hero.component.yml",
    category: "Layout",
    summary: "The opening section of a landing page.",
    props: [
      { name: "heading", type: "string", required: true, description: "One line on desktop." },
      { name: "subheading", type: "string", description: "One or two sentences." },
      { name: "cta_label", type: "string", description: "Rendered with Button, variant primary." },
      {
        name: "align",
        type: "start | center",
        default: "start",
        description: "Center only without media.",
      },
    ],
    requests: 22,
    updated: "1 month ago",
    related: ["button"],
  },
  {
    id: "breadcrumb",
    name: "Breadcrumb",
    status: "stable",
    source: "sdc",
    machine: "charged_ui:breadcrumb",
    file: "components/breadcrumb/breadcrumb.component.yml",
    category: "Navigation",
    summary: "Shows where a page sits in the site hierarchy.",
    props: [
      {
        name: "items",
        type: "array<{ label, href }>",
        required: true,
        description: "From the home page down.",
      },
      {
        name: "show_current",
        type: "boolean",
        default: "true",
        description: "Shows the current page as plain text.",
      },
    ],
    whenToUse: ["On pages three or more levels deep."],
    examples: [
      {
        key: "depth",
        rule: "SHOULD NOT show Breadcrumb on top-level pages.",
        do: {
          title: "Deep pages",
          caption: "Show the path on a third-level page.",
          preview: "crumb-good",
          code: "{{ include('charged_ui:breadcrumb', { items: trail }) }}",
        },
        dont: {
          title: "Top-level pages",
          caption: "A one-item trail adds nothing.",
          preview: "crumb-bad",
          code: "{# Home > About #}",
        },
      },
    ],
    requests: 19,
    updated: "1 month ago",
  },
  {
    id: "pagination",
    name: "Pagination",
    status: "stable",
    source: "sdc",
    machine: "charged_ui:pagination",
    file: "components/pagination/pagination.component.yml",
    category: "Navigation",
    summary: "Moves between pages of a long list.",
    props: [
      { name: "current", type: "integer", required: true, description: "The page being shown." },
      { name: "total", type: "integer", required: true, description: "Total number of pages." },
    ],
    whenToUse: ["For lists longer than 24 items."],
    examples: [
      {
        key: "range",
        rule: "SHOULD show at most seven page numbers.",
        do: {
          title: "Short range",
          caption: "Collapse long ranges with an ellipsis.",
          preview: "pages-good",
          code: "{{ include('charged_ui:pagination', { current: 4, total: 12 }) }}",
        },
        dont: {
          title: "Every page",
          caption: "Twelve numbers wrap on phones.",
          preview: "pages-bad",
          code: "{# 1 2 3 4 5 6 7 8 9 10 11 12 #}",
        },
      },
    ],
    requests: 12,
    updated: "2 days ago",
  },
  {
    id: "pager",
    name: "Pager",
    status: "deprecated",
    source: "sdc",
    machine: "charged_ui:pager",
    file: "components/pager/pager.component.yml",
    category: "Navigation",
    summary: "Previous and next links. Replaced by Pagination.",
    replacedBy: "pagination",
    props: [
      { name: "prev_href", type: "uri", description: "Link to the previous page." },
      { name: "next_href", type: "uri", description: "Link to the next page." },
    ],
    requests: 9,
    updated: "2 days ago",
  },
];

export type Token = {
  id: string;
  group: "color" | "type" | "space" | "radius";
  value: string;
  note: string;
  usedBy: number;
  changed?: string;
};

export const tokens: Token[] = [
  { id: "color.ink", group: "color", value: "#171717", note: "Body text and icons", usedBy: 11 },
  {
    id: "color.muted",
    group: "color",
    value: "#737373",
    note: "Secondary text and metadata",
    usedBy: 8,
  },
  { id: "color.line", group: "color", value: "#E5E5E5", note: "Borders and dividers", usedBy: 9 },
  {
    id: "color.surface",
    group: "color",
    value: "#FFFFFF",
    note: "Page and card background",
    usedBy: 10,
  },
  {
    id: "color.surface-dark",
    group: "color",
    value: "#0A0A0A",
    note: "Dark sections and code",
    usedBy: 4,
  },
  {
    id: "color.action.primary",
    group: "color",
    value: "#2563EB",
    note: "Primary buttons, links, selection",
    usedBy: 7,
  },
  {
    id: "color.action.primary-hover",
    group: "color",
    value: "#1D4ED8",
    note: "Hover and pressed for primary",
    usedBy: 3,
    changed: "#1E40AF",
  },
  {
    id: "color.action.soft",
    group: "color",
    value: "#DBEAFE",
    note: "Selected rows and info callouts",
    usedBy: 4,
  },
  {
    id: "color.focus",
    group: "color",
    value: "#93C5FD",
    note: "Focus rings, 2px",
    usedBy: 12,
    changed: "#BFDBFE",
  },
  {
    id: "color.status.success",
    group: "color",
    value: "#16A34A",
    note: "Success callouts and badges",
    usedBy: 2,
  },
  { id: "color.status.warning", group: "color", value: "#D97706", note: "Warnings", usedBy: 2 },
  {
    id: "color.status.danger",
    group: "color",
    value: "#DC2626",
    note: "Errors and destructive actions",
    usedBy: 3,
  },
  {
    id: "font.display",
    group: "type",
    value: "Geist 700, 48/52, -0.035em",
    note: "Hero headings",
    usedBy: 1,
  },
  {
    id: "font.heading",
    group: "type",
    value: "Geist 700, 30/36, -0.035em",
    note: "Page and section headings",
    usedBy: 4,
  },
  {
    id: "font.subhead",
    group: "type",
    value: "Geist 400, 20/28",
    note: "Intros under headings, in color.muted",
    usedBy: 2,
  },
  {
    id: "font.body",
    group: "type",
    value: "Geist 400, 16/27",
    note: "Body copy, about 60 characters per line",
    usedBy: 9,
  },
  {
    id: "font.label",
    group: "type",
    value: "Geist 500, 14/20",
    note: "Buttons, menus, form labels",
    usedBy: 6,
    changed: "Geist 500, 14/18",
  },
  {
    id: "font.mono",
    group: "type",
    value: "Geist Mono 400, 13/20",
    note: "Code, labels, metadata",
    usedBy: 2,
  },
  { id: "space.1", group: "space", value: "4px", note: "Icon to label", usedBy: 6 },
  { id: "space.2", group: "space", value: "8px", note: "Inside compact controls", usedBy: 8 },
  { id: "space.3", group: "space", value: "12px", note: "Between related items", usedBy: 5 },
  { id: "space.4", group: "space", value: "16px", note: "Between stacked form fields", usedBy: 7 },
  { id: "space.6", group: "space", value: "24px", note: "Card padding and grid gaps", usedBy: 6 },
  { id: "space.8", group: "space", value: "32px", note: "Between groups in a section", usedBy: 4 },
  { id: "space.16", group: "space", value: "64px", note: "Between page sections", usedBy: 3 },
  {
    id: "space.control-x",
    group: "space",
    value: "14px",
    note: "Horizontal padding in buttons",
    usedBy: 2,
    changed: "12px",
  },
  {
    id: "radius.control",
    group: "radius",
    value: "8px",
    note: "Buttons, inputs, callouts",
    usedBy: 6,
  },
  { id: "radius.card", group: "radius", value: "12px", note: "Cards and dialogs", usedBy: 3 },
  { id: "radius.pill", group: "radius", value: "999px", note: "Badges and avatars", usedBy: 2 },
];

export type Question = {
  id: string;
  text: string;
  count: number;
  status: "answered" | "gap";
  source?: { label: string; route: string };
  fileId?: string;
  resolves?: { label: string; route: string };
};

export const questions: Question[] = [
  {
    id: "q-loading",
    text: "How do I show a loading state on Button?",
    count: 14,
    status: "gap",
    fileId: "button",
    resolves: { label: "Button: Loading state", route: "component-button" },
  },
  {
    id: "q-spacing",
    text: "Which spacing token goes between stacked form fields?",
    count: 9,
    status: "answered",
    source: { label: "Layout and spacing", route: "guide-layout" },
  },
  {
    id: "q-nesting",
    text: "Can a Card contain another Card?",
    count: 7,
    status: "gap",
    fileId: "card",
    resolves: { label: "Card: Nesting", route: "component-card" },
  },
  {
    id: "q-danger",
    text: "Is there a danger variant for Button?",
    count: 6,
    status: "answered",
    source: { label: "Button props", route: "component-button" },
  },
  {
    id: "q-nav",
    text: "Should section navigation use Tabs or Menu?",
    count: 5,
    status: "answered",
    source: { label: "Navigation patterns", route: "guide-navigation" },
  },
  {
    id: "q-pager",
    text: "What replaced Pager?",
    count: 4,
    status: "answered",
    source: { label: "Pager", route: "component-pager" },
  },
  {
    id: "q-icon",
    text: "How do I make an icon-only button accessible?",
    count: 3,
    status: "answered",
    source: { label: "Button accessibility", route: "component-button" },
  },
];

export const agentStats = {
  week: [142, 168, 201, 187, 236, 94, 256],
  days: ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"],
  clients: [
    { name: "Claude Code", share: 58 },
    { name: "Cursor", share: 31 },
    { name: "Codex", share: 11 },
  ],
  tools: [
    {
      name: "get_component",
      count: 642,
      description: "Props, rules, examples, and tokens for one component.",
    },
    {
      name: "search_docs",
      count: 388,
      description: "Searches every page and returns the matching sections.",
    },
    {
      name: "check_usage",
      count: 171,
      description: "Checks a snippet against your rules before the agent commits it.",
    },
    { name: "get_tokens", count: 83, description: "Token names and values for a category." },
  ],
};

export type Commit = { sha: string; message: string; author: string; when: string; bot?: boolean };

export const initialCommits: Commit[] = [
  {
    sha: "3e1a9f2",
    message: "Sync tokens from Figma (4 changed)",
    author: "Figma sync",
    when: "2 hours ago",
    bot: true,
  },
  {
    sha: "b72c0d4",
    message: "Document Callout tones and examples",
    author: "Mitch Kostelecky",
    when: "Yesterday",
  },
  {
    sha: "91fe7a0",
    message: "Import Pagination from SDC",
    author: "Mitch Kostelecky",
    when: "2 days ago",
  },
  {
    sha: "4c2d8b1",
    message: "Mark Pager as deprecated",
    author: "Mitch Kostelecky",
    when: "2 days ago",
  },
  {
    sha: "e08a2f6",
    message: "Add Navigation patterns guideline",
    author: "Mitch Kostelecky",
    when: "4 days ago",
  },
];

export type DocFile = {
  id: string;
  kind: "component" | "guideline";
  title: string;
  description: string;
  path: string;
  updated: string;
  body: string;
};

const T = "`";

export const guidelineFiles: DocFile[] = [
  {
    id: "buttons-and-links",
    kind: "guideline",
    title: "Buttons and links",
    description: "When to use a button, when to use a link, and how to label both.",
    path: "docs/guidelines/buttons-and-links.mdx",
    updated: "3 days ago",
    body: `---
title: Buttons and links
description: When to use a button, when to use a link, and how to label both.
---

Buttons start actions. Links take people somewhere. If clicking it changes data, it’s a button. If it changes the URL, it’s a link.

<Preview component="button" variant="primary" label="Save changes" />

## Choosing a variant

- Use ${T}primary${T} for the one action that completes the view.
- Use ${T}secondary${T} for the actions that sit beside it.
- Use ${T}ghost${T} in toolbars, table rows, and other dense layouts.
- Use ${T}danger${T} only when the action deletes something or can’t be undone.

<Do title="One clear next step">
A form ends with one primary button and one secondary button.
</Do>

<Dont title="Two primaries">
Two primary buttons compete for the same click.
</Dont>

## Writing labels

Start with a verb and keep it to three words or fewer: “Save changes”, “Invite people”, “Export CSV”. Avoid “Click here” and “Submit”, which say nothing about what happens next.

## Links that look like buttons

When a call to action navigates, pass ${T}href${T} to Button. Don’t style a raw ${T}<a>${T} with button classes, because it skips focus, sizing, and loading behavior.

<Callout tone="info">
Agents read this page too. Rules written as plain, specific sentences work best for both.
</Callout>
`,
  },
  {
    id: "navigation",
    kind: "guideline",
    title: "Navigation patterns",
    description: "Choosing between Menu, Tabs, and Breadcrumb.",
    path: "docs/guidelines/navigation.mdx",
    updated: "4 days ago",
    body: `---
title: Navigation patterns
description: Choosing between Menu, Tabs, and Breadcrumb.
---

Most navigation questions come down to one test: does the item have its own URL?

## Menu or Tabs

Use Menu when each item is its own page with its own URL. Use Tabs when the items are views of the same page and switching them shouldn’t change the URL.

<Do title="Tabs for views">
Switch between Overview, Specs, and Reviews on one product page.
</Do>

<Dont title="Tabs for pages">
Put site sections like About and Contact in Tabs.
</Dont>

## Breadcrumb

Show Breadcrumb on pages three or more levels deep. Leave it off the home page and top-level sections.

## Active state

Menu marks the current page with ${T}active_trail${T}. Don’t mark a parent and a child active at the same time.
`,
  },
  {
    id: "layout",
    kind: "guideline",
    title: "Layout and spacing",
    description: "The spacing scale and how sections stack.",
    path: "docs/guidelines/layout.mdx",
    updated: "1 week ago",
    body: `---
title: Layout and spacing
description: The spacing scale and how sections stack.
---

Spacing uses a 4px base. Reach for tokens, not raw pixel values.

## Stacking

- Form fields stack with ${T}space.4${T}.
- Cards in a grid use a ${T}space.6${T} gap.
- Page sections are separated by ${T}space.16${T}.

<Do title="Tokens">
Stack form fields with space.4.
</Do>

<Dont title="Raw values">
Hard-code an 18px margin between fields.
</Dont>

## Width

Body copy stays near 60 characters per line. Wide layouts add columns, not longer lines.
`,
  },
  {
    id: "writing",
    kind: "guideline",
    title: "Writing for interfaces",
    description: "Voice, tone, and the words used inside components.",
    path: "docs/guidelines/writing.mdx",
    updated: "2 weeks ago",
    body: `---
title: Writing for interfaces
description: Voice, tone, and the words used inside components.
---

Write the way a helpful colleague talks: plain verbs, short sentences, sentence case.

## Sentence case everywhere

Headings, buttons, and menu items use sentence case. Only proper nouns get capitals.

## Name things by what people do

Say Notifications, not Webhook config. Call an action Publish, and keep calling it Publish through the whole flow.

## Errors

Say what happened and what to do next. “Card number is too short. Check the last four digits.” beats “Invalid input.”
`,
  },
  {
    id: "accessibility",
    kind: "guideline",
    title: "Accessibility",
    description: "The baseline every component meets, and what you still own.",
    path: "docs/guidelines/accessibility.mdx",
    updated: "3 weeks ago",
    body: `---
title: Accessibility
description: The baseline every component meets, and what you still own.
---

Every component ships with keyboard support, visible focus, and WCAG 2.2 AA contrast in both themes. You still own the content.

## Focus

Never remove focus outlines. Custom focus styles use ${T}color.focus${T} at 2px.

## Touch targets

Interactive elements are at least 40 by 40 pixels on touch screens. Button sizes ${T}md${T} and ${T}lg${T} meet this.

## Images

Media in Card and Hero needs alt text unless it’s purely decorative.
`,
  },
];

export const componentFiles: Record<string, string> = {
  button: `---
component: charged_ui:button
status: stable
---

Starts an action or moves someone to the next step of a flow. Use one primary button per view.

## When to use

- To start an action in place, like saving, sending, or deleting.
- To move someone to the next step of a flow. Pass ${T}href${T} and it renders a link.

## When not to use

- For navigation inside running text. Use a text link.
- To switch a setting on or off. Use Switch.

<Do title="One primary action">
Pair one primary button with a secondary one.
</Do>

<Dont title="Competing primaries">
Two primary buttons fight for the same click.
</Dont>

## Accessibility

- Give icon-only buttons an ${T}aria_label${T}. The icon alone isn’t announced.
- Never remove the focus ring. It uses ${T}color.focus${T}.
`,
  card: `---
component: charged_ui:card
status: stable
---

Groups content and actions about a single subject, like an article or a program.

## When to use

- To show a set of comparable items, like articles or programs, in a grid.
- To link to a detail page with a short preview.

## When not to use

- For a single block of text. Use a section with a heading.

## Accessibility

- When ${T}href${T} is set, the title is the link text. Don’t add a second link inside the card.
`,
  callout: `---
component: charged_ui:callout
status: stable
---

Draws attention to information that changes what someone does next.

## When to use

- To warn about a consequence before someone acts.
- To confirm that something worked when the page doesn’t change.

<Do title="One per section">
Put the consequence in the title.
</Do>

<Dont title="Stacked callouts">
Three in a row read as noise.
</Dont>
`,
};

/** AI drafts the prototype can produce for open agent questions. */
export const drafts: Record<
  string,
  { fileId: string; prompt: string; text: string; commit: string }
> = {
  "q-loading": {
    fileId: "button",
    prompt: "How do I show a loading state on Button?",
    commit: "Document Button loading state",
    text: `
## Loading state

Set ${T}loading: true${T} while the request is in flight. Keep the label so the button keeps its width, and ignore repeat clicks until the request finishes.

<Do title="Keep the label">
Show the spinner beside “Save changes”.
</Do>

<Dont title="Swap the label">
Replace the label with “Loading…” or hide the button.
</Dont>
`,
  },
  "q-nesting": {
    fileId: "card",
    prompt: "Can a Card contain another Card?",
    commit: "Document Card nesting",
    text: `
## Nesting

Don’t put a Card inside another Card. Nested borders and shadows make the hierarchy hard to read. Use a list or a plain section inside the card body instead.

<Do title="List inside a card">
Show related items as a simple list in the body slot.
</Do>

<Dont title="Card in a card">
Place a second bordered card inside the first.
</Dont>
`,
  },
};

export const integrations = [
  {
    id: "github",
    name: "GitHub",
    status: "connected",
    detail: "charged-labs/charged-ui on main. Every push rebuilds the site and agent context.",
  },
  {
    id: "sdc",
    name: "Drupal SDC",
    status: "connected",
    detail: "Reads components/**/*.component.yml. 12 components, props and slots kept in sync.",
  },
  {
    id: "figma",
    name: "Figma variables",
    status: "connected",
    detail: "Charged UI Tokens file. Last sync 2 hours ago, 4 tokens changed.",
  },
  {
    id: "block",
    name: "WordPress block.json",
    status: "available",
    detail: "Import blocks from a theme or plugin. Attributes become props.",
  },
  {
    id: "mintlify",
    name: "Mintlify import",
    status: "available",
    detail: "Bring docs.json and MDX pages over in one step.",
  },
  {
    id: "storybook",
    name: "Storybook",
    status: "planned",
    detail: "Use existing stories as live previews.",
  },
] as const;

/*
  Exploration: one Corpus install with two projects, a design system and a docs
  space. See docs/decisions/proposed-projects-and-docs.md. This extends the sample
  data on purpose, with the owner's go-ahead, and goes away with it in Phase 2.
*/

export type ProjectKind = "design-system" | "docs";

/** A docs page. `path` is its place in the repository, like docs/engineering/deploying.md. `lines` is its frontmatter. */
export type DocPage = {
  id: string;
  path: string;
  title: string;
  folder: string;
  description: string;
  updated: string;
  lines: string[];
  body: string;
};

export type ProjectQuestion = {
  id: string;
  text: string;
  count: number;
  status: "answered" | "gap";
  source?: { label: string; route: string };
};

export const handbook = {
  id: "handbook",
  name: "Web team handbook",
  description: "How the web team builds, ships, and supports campus sites.",
  site: "handbook.charged.dev",
  repo: "charged-labs/handbook",
  requests: 486,
  updated: "Yesterday",
  questions: [
    { id: "h-rollback", text: "How do I roll back a deploy?", count: 9, status: "gap" },
    {
      id: "h-oncall",
      text: "Who is on call this week?",
      count: 6,
      status: "answered",
      source: { label: "On-call and incidents", route: "handbook-on-call" },
    },
    {
      id: "h-dates",
      text: "How should I write dates?",
      count: 4,
      status: "answered",
      source: { label: "Content style guide", route: "handbook-content-style" },
    },
  ] as ProjectQuestion[],
  // The pages are Markdown files in fixtures/handbook. See src/data/handbook-pages.ts.
  pages: handbookPages,
};
