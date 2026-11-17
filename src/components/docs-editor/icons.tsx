// The editor's icon set, in one place so the library can change without
// touching the components. Glyphs come from reicon (reicon.dev) in its outline
// weight. Reicon has no heading or strikethrough glyphs, so those are set as
// type, the way Notion labels them, and the grip is the ellipsis turned on its
// side.
import * as React from "react";
import {
  AlignHCenter,
  AlignLeft,
  AlignRight,
  AngleDown,
  AngleUp,
  ArrowDown,
  ArrowUp,
  Check,
  Code,
  CodeSquare,
  Copy,
  Export,
  FileText,
  Grid,
  Image,
  ImagePlus,
  Link,
  ListCheck,
  Minus,
  More,
  OrderedList,
  Plus,
  QuoteUp,
  Redo,
  Search,
  Text,
  TextBold,
  TextItalic,
  Trash,
  UnorderedList,
  Undo,
  X,
} from "reicon-react";

import { cn } from "@/lib/utils";

export type EditorIcon = React.ComponentType<{ className?: string }>;

/** A letterform icon: the same 16px box the SVG icons fill, so rows stay aligned. */
function Glyph({
  label,
  className,
  struck = false,
}: {
  label: string;
  className?: string;
  struck?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 select-none items-center justify-center text-[9.5px] leading-none font-semibold tracking-[-0.04em]",
        struck && "line-through decoration-[1.5px]",
        className,
      )}
    >
      {label}
    </span>
  );
}

export const TextIcon: EditorIcon = Text;
export const Heading1Icon: EditorIcon = ({ className }) => (
  <Glyph label="H1" className={className} />
);
export const Heading2Icon: EditorIcon = ({ className }) => (
  <Glyph label="H2" className={className} />
);
export const Heading3Icon: EditorIcon = ({ className }) => (
  <Glyph label="H3" className={className} />
);
export const BoldIcon: EditorIcon = TextBold;
export const ItalicIcon: EditorIcon = TextItalic;
export const StrikeIcon: EditorIcon = ({ className }) => (
  <Glyph label="S" className={className} struck />
);
export const CodeIcon: EditorIcon = Code;
export const CodeBlockIcon: EditorIcon = CodeSquare;
export const LinkIcon: EditorIcon = Link;
export const BulletListIcon: EditorIcon = UnorderedList;
export const OrderedListIcon: EditorIcon = OrderedList;
export const TaskListIcon: EditorIcon = ListCheck;
export const QuoteIcon: EditorIcon = QuoteUp;
export const DividerIcon: EditorIcon = Minus;
export const TableIcon: EditorIcon = Grid;
export const ImageIcon: EditorIcon = Image;
export const ImagePlusIcon: EditorIcon = ImagePlus;
export const PlusIcon: EditorIcon = Plus;
export const UndoIcon: EditorIcon = Undo;
export const RedoIcon: EditorIcon = Redo;
export const TrashIcon: EditorIcon = Trash;
export const CopyIcon: EditorIcon = Copy;
export const ChevronDownIcon: EditorIcon = AngleDown;
export const ChevronUpIcon: EditorIcon = AngleUp;
export const ArrowUpIcon: EditorIcon = ArrowUp;
export const ArrowDownIcon: EditorIcon = ArrowDown;
export const FileTextIcon: EditorIcon = FileText;
export const AlignLeftIcon: EditorIcon = AlignLeft;
export const AlignCenterIcon: EditorIcon = AlignHCenter;
export const AlignRightIcon: EditorIcon = AlignRight;
export const OpenIcon: EditorIcon = Export;
export const SearchIcon: EditorIcon = Search;
export const CheckIcon: EditorIcon = Check;
export const XIcon: EditorIcon = X;

/** The block grip: reicon's ellipsis, turned upright. */
export const GripIcon: EditorIcon = ({ className }) => (
  <More className={cn("rotate-90", className)} />
);
