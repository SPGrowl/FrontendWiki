"use client";

interface EntryPathPreviewProps {
  href: string;
}

export function EntryPathPreview({ href }: EntryPathPreviewProps) {
  if (!href) return null;

  return (
    <div className="flex flex-col gap-1.5 rounded-none border border-dashed border-border bg-muted/20 p-3">
      <span className="text-xs font-medium">路径预览</span>
      <code className="break-all text-xs text-muted-foreground">{href}</code>
    </div>
  );
}
