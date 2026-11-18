// The editor's icon set, in one place so the library can change without
// touching the components. Glyphs come from Heroicons' outline weight.
// Heroicons has no heading glyphs, so those are set as type, the way Notion
// labels them.
import * as React from "react";
import {
  ArrowDownIcon as HeroArrowDown,
  ArrowTopRightOnSquareIcon,
  ArrowUpIcon as HeroArrowUp,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Bars3Icon,
  BoldIcon as HeroBold,
  ChatBubbleBottomCenterTextIcon,
  CheckIcon as HeroCheck,
  ChevronDownIcon as HeroChevronDown,
  ChevronUpIcon as HeroChevronUp,
  ClipboardDocumentCheckIcon,
  CodeBracketIcon,
  CodeBracketSquareIcon,
  DocumentTextIcon,
  EllipsisVerticalIcon,
  ItalicIcon as HeroItalic,
  LinkIcon as HeroLink,
  MagnifyingGlassIcon,
  MinusIcon as HeroMinus,
  PhotoIcon,
  PlusIcon as HeroPlus,
  QueueListIcon,
  Square2StackIcon,
  StrikethroughIcon as HeroStrike,
  TableCellsIcon,
  TrashIcon as HeroTrash,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { cn } from "@/lib/utils";

export type EditorIcon = React.ComponentType<{ className?: string }>;

/** A letterform icon: the same 16px box the SVG icons fill, so rows stay aligned. */
function Glyph({ label, className }: { label: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 select-none items-center justify-center text-[9.5px] leading-none font-semibold tracking-[-0.04em]",
        className,
      )}
    >
      {label}
    </span>
  );
}

export const TextIcon: EditorIcon = Bars3BottomLeftIcon;
export const Heading1Icon: EditorIcon = ({ className }) => (
  <Glyph label="H1" className={className} />
);
export const Heading2Icon: EditorIcon = ({ className }) => (
  <Glyph label="H2" className={className} />
);
export const Heading3Icon: EditorIcon = ({ className }) => (
  <Glyph label="H3" className={className} />
);
export const BoldIcon: EditorIcon = HeroBold;
export const ItalicIcon: EditorIcon = HeroItalic;
export const StrikeIcon: EditorIcon = HeroStrike;
export const CodeIcon: EditorIcon = CodeBracketIcon;
export const CodeBlockIcon: EditorIcon = CodeBracketSquareIcon;
export const LinkIcon: EditorIcon = HeroLink;
export const BulletListIcon: EditorIcon = Bars3Icon;
export const OrderedListIcon: EditorIcon = QueueListIcon;
export const TaskListIcon: EditorIcon = ClipboardDocumentCheckIcon;
export const QuoteIcon: EditorIcon = ChatBubbleBottomCenterTextIcon;
export const DividerIcon: EditorIcon = HeroMinus;
export const TableIcon: EditorIcon = TableCellsIcon;
export const ImageIcon: EditorIcon = PhotoIcon;
export const ImagePlusIcon: EditorIcon = PhotoIcon;
export const PlusIcon: EditorIcon = HeroPlus;
export const UndoIcon: EditorIcon = ArrowUturnLeftIcon;
export const RedoIcon: EditorIcon = ArrowUturnRightIcon;
export const TrashIcon: EditorIcon = HeroTrash;
export const CopyIcon: EditorIcon = Square2StackIcon;
export const ChevronDownIcon: EditorIcon = HeroChevronDown;
export const ChevronUpIcon: EditorIcon = HeroChevronUp;
export const ArrowUpIcon: EditorIcon = HeroArrowUp;
export const ArrowDownIcon: EditorIcon = HeroArrowDown;
export const FileTextIcon: EditorIcon = DocumentTextIcon;
export const AlignLeftIcon: EditorIcon = Bars3BottomLeftIcon;
export const AlignCenterIcon: EditorIcon = Bars3Icon;
export const AlignRightIcon: EditorIcon = Bars3BottomRightIcon;
export const OpenIcon: EditorIcon = ArrowTopRightOnSquareIcon;
export const SearchIcon: EditorIcon = MagnifyingGlassIcon;
export const CheckIcon: EditorIcon = HeroCheck;
export const XIcon: EditorIcon = XMarkIcon;
export const GripIcon: EditorIcon = EllipsisVerticalIcon;
