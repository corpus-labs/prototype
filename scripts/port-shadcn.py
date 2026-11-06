"""Port shadcn/ui Base UI registry components into this project.

Mirrors what `npx shadcn add` does for the Base UI flavor: inlines the chosen
style's `cn-*` classes as Tailwind utilities, resolves icon placeholders to
lucide-react, and rewrites registry import aliases.
"""
import re, sys, pathlib

REG = pathlib.Path(sys.argv[1])          # .../apps/v4/registry
STYLE = sys.argv[2]                      # e.g. nova
OUT = pathlib.Path(sys.argv[3])          # project src dir
NAMES = sys.argv[4].split(",")

css = (REG / "styles" / f"style-{STYLE}.css").read_text()
style_map = {}
EXCLUDE = {"cn-menu-translucent", "cn-menu-translucent-aria"}
for m in re.finditer(r"\.(cn-[a-z0-9-]+)\s*\{\s*@apply\s+([^;]+);\s*\}", css):
    if m.group(1) not in EXCLUDE:
        style_map[m.group(1)] = m.group(2).strip()

unknown = set()

def map_classes(s: str) -> str:
    def rep(m):
        tok = m.group(0)
        if tok in style_map:
            return style_map[tok]
        unknown.add(tok)
        return ""
    out = re.sub(r"(?<![\w-])cn-[a-z0-9-]+(?![\w-])", rep, s)
    return re.sub(r"[ \t]{2,}", " ", out).replace('" ', '"').replace(' "', '"') if out != s else s

def lookup(t):
    tok = t.group(0)
    if tok in style_map:
        return style_map[tok]
    unknown.add(tok)
    return ""

def transform_strings(src: str) -> str:
    # double-quoted string literals and template literals
    def rep_dq(m):
        inner = m.group(1)
        if "cn-" not in inner:
            return m.group(0)
        new = re.sub(r"(?<![\w-])cn-[a-z0-9-]+(?![\w-])",
                     lookup, inner)
        new = re.sub(r"\s{2,}", " ", new).strip()
        return '"' + new + '"'
    src = re.sub(r'"((?:[^"\\\n]|\\.)*)"', rep_dq, src)
    def rep_bt(m):
        inner = m.group(1)
        if "cn-" not in inner:
            return m.group(0)
        new = re.sub(r"(?<![\w-])cn-[a-z0-9-]+(?![\w-])",
                     lookup, inner)
        return "`" + re.sub(r"[ ]{2,}", " ", new) + "`"
    src = re.sub(r"`([^`]*)`", rep_bt, src)
    return src

def transform_icons(src: str):
    icons = set()
    def rep(m):
        attrs = m.group(1)
        lm = re.search(r'lucide="([A-Za-z0-9]+)"', attrs)
        if not lm:
            raise SystemExit("icon placeholder without lucide name: " + m.group(0))
        name = lm.group(1)
        icons.add(name)
        rest = re.sub(r'\s*(lucide|tabler|hugeicons|phosphor|remixicon)="[^"]*"', "", attrs)
        rest = re.sub(r"\s+", " ", rest).strip()
        return f"<{name}{(' ' + rest) if rest else ''} />"
    src = re.sub(r"<IconPlaceholder\b([\s\S]*?)/>", rep, src)
    src = re.sub(r'import \{ IconPlaceholder \} from "[^"]+"\n', "", src)
    if icons:
        imp = "import { " + ", ".join(sorted(icons)) + ' } from "lucide-react"\n'
        # insert after last import line block
        lines = src.split("\n")
        last = 0
        i = 0
        while i < len(lines):
            if lines[i].startswith("import "):
                j = i
                while not re.search(r'from "[^"]+"$|^import "[^"]+"$', lines[j]):
                    j += 1
                last = j
                i = j + 1
            else:
                i += 1
        lines.insert(last + 1, imp.rstrip("\n"))
        src = "\n".join(lines)
    return src

for name in NAMES:
    p = REG / "bases" / "base" / "ui" / f"{name}.tsx"
    src = p.read_text()
    src = src.replace('"use client"\n\n', "").replace('"use client"\n', "")
    src = src.replace('import { cn } from "cn"', 'import { cn } from "@/lib/utils"')
    src = src.replace("@/registry/bases/base/ui/", "@/components/ui/")
    src = src.replace("@/registry/bases/base/hooks/", "@/hooks/")
    src = src.replace("@/registry/bases/base/lib/", "@/lib/")
    src = transform_icons(src)
    src = transform_strings(src)
    out = OUT / "components" / "ui" / f"{name}.tsx"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(src)
    left = re.findall(r"(?<![\w-])cn-[a-z0-9-]+", src)
    if left:
        print("WARN leftover", name, set(left))

print("unknown cn tokens:", sorted(unknown))
print("mapped", len(style_map), "style rules")
