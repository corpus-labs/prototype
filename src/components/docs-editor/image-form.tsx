// Inserting images: a dialog for pasting a link or choosing a file, and the
// uploader behind paste and drop. Files are downscaled and embedded as data
// URLs until Phase 5 can write them to the repository.
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

import { ImagePlusIcon } from "./icons";

/** The long edge an embedded image is clamped to before encoding. */
const MAX_EDGE = 1600;
/** What an embedded image may weigh, roughly, before the insert is refused. */
const MAX_BYTES = 1_500_000;

/**
 * Reads an image file as a data URL, shrinking it to fit first. Animated GIFs
 * pass through untouched, since a canvas would flatten them.
 */
export async function embedImage(file: File): Promise<string> {
  const bitmap = await readBitmap(file);
  if (!bitmap) return readAsDataUrl(file);

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  const encoded = canvas.toDataURL("image/jpeg", 0.82);
  // A tiny original is better kept as it came.
  return encoded.length < file.size * 1.2 || scale < 1 ? encoded : readAsDataUrl(file);
}

async function readBitmap(file: File): Promise<ImageBitmap | null> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return null;
  try {
    return await createImageBitmap(file);
  } catch {
    return null;
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result as string), false);
    reader.addEventListener("error", () => reject(reader.error), false);
    reader.readAsDataURL(file);
  });
}

/** Embeds every image in a list, refusing anything that stays too large. */
export async function embedImages(files: File[]): Promise<{ src: string; alt: string }[]> {
  const images = files.filter((f) => f.type.startsWith("image/"));
  const embedded: { src: string; alt: string }[] = [];
  for (const file of images) {
    const src = await embedImage(file);
    if (src.length > MAX_BYTES) {
      toast.add({
        title: "Image too large to embed",
        description: `${file.name} is still over 1.5 MB after shrinking. Link to it instead.`,
      });
      continue;
    }
    embedded.push({ src, alt: file.name.replace(/\.[a-z0-9]+$/i, "") });
  }
  return embedded;
}

/**
 * The dialog the slash menu and the toolbar open: paste a link, or choose a
 * file to embed. Apply hands the result to the editor's insert command.
 */
export function ImageForm({
  open,
  onOpenChange,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (image: { src: string; alt: string }) => void;
}) {
  const [src, setSrc] = React.useState("");
  const [alt, setAlt] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setSrc("");
      setAlt("");
      setBusy(false);
    }
  }, [open]);

  const apply = (next: { src: string; alt: string }) => {
    if (!next.src.trim()) return;
    onApply(next);
    onOpenChange(false);
  };

  const chooseFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const [embedded] = await embedImages([file]);
      if (embedded) apply(embedded);
    } catch {
      toast.add({
        title: "Reading the image failed",
        description: "Try again, or paste a link instead.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert an image</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="image-src">Link or embedded source</Label>
            <Input
              id="image-src"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="font-mono text-[13px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image-alt">Description</Label>
            <Input
              id="image-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="What the picture shows"
            />
          </div>
          <div className="relative">
            <div aria-hidden className="h-px bg-border" />
            <span className="absolute inset-x-0 -top-2 mx-auto w-fit bg-background px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input px-3 py-4 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground">
            <ImagePlusIcon className="size-4" />
            {busy ? "Reading the file…" : "Choose a file to embed"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void chooseFile(e.target.files?.[0])}
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!src.trim()}
            onClick={() => apply({ src: src.trim(), alt: alt.trim() })}
          >
            Insert image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
