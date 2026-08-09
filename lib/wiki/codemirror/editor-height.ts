const ROOT_FONT_SIZE_PX = 16;

export interface EditorHeightBoundsPx {
  minPx: number;
  maxPx: number;
}

export function parseCssLengthToPx(
  value: string,
  viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800
): number {
  const trimmed = value.trim();

  if (trimmed.endsWith("vh")) {
    return (parseFloat(trimmed) / 100) * viewportHeight;
  }

  if (trimmed.endsWith("rem")) {
    return parseFloat(trimmed) * ROOT_FONT_SIZE_PX;
  }

  if (trimmed.endsWith("px")) {
    return parseFloat(trimmed);
  }

  const numeric = parseFloat(trimmed);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function resolveEditorHeightBoundsPx(
  minHeight: string,
  maxHeight: string,
  viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800
): EditorHeightBoundsPx {
  const minPx = parseCssLengthToPx(minHeight, viewportHeight);
  const maxPx = parseCssLengthToPx(maxHeight, viewportHeight);

  return {
    minPx,
    maxPx: Math.max(minPx, maxPx),
  };
}

export function clampEditorHeightPx(
  contentHeightPx: number,
  minPx: number,
  maxPx: number
): number {
  const roundedContentHeight = Math.ceil(contentHeightPx);
  return Math.min(maxPx, Math.max(minPx, roundedContentHeight));
}
