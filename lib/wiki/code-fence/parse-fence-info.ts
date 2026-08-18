export interface FenceInfo {
  language: string;
  full: boolean;
  id?: string;
}

/**
 * 解析围栏 info string。
 * 例：lang=`html` meta=`full id=card-mq`
 */
export function parseFenceInfo(
  lang: string | null | undefined,
  meta: string | null | undefined
): FenceInfo {
  const language = (lang ?? "").trim().toLowerCase();
  const tokens = (meta ?? "").trim().split(/\s+/).filter(Boolean);
  let full = false;
  let id: string | undefined;

  for (const token of tokens) {
    if (token === "full") {
      full = true;
      continue;
    }

    const match = /^id=(?:"([^"]+)"|'([^']+)'|([^\s]+))$/.exec(token);
    if (match) {
      const value = match[1] ?? match[2] ?? match[3];
      if (value) id = value;
    }
  }

  return { language, full, id };
}
