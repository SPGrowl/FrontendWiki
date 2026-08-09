import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { EditorView } from "@codemirror/view";

export function createWikiEditorTheme() {
  return EditorView.theme(
    {
      "&": {
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        fontSize: "13px",
        height: "100%",
      },
      ".cm-scroller": {
        fontFamily: "var(--font-mono)",
        lineHeight: "1.65",
      },
      ".cm-content": {
        caretColor: "var(--wiki-accent)",
        padding: "10px 0",
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "var(--wiki-accent)",
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        {
          backgroundColor: "var(--wiki-accent-muted) !important",
        },
      ".cm-activeLine": {
        backgroundColor: "color-mix(in oklch, var(--muted) 55%, transparent)",
      },
      ".cm-gutters": {
        backgroundColor: "var(--wiki-code-bg)",
        color: "var(--muted-foreground)",
        borderRight: "1px solid var(--border)",
      },
      ".cm-activeLineGutter": {
        backgroundColor: "color-mix(in oklch, var(--muted) 70%, transparent)",
        color: "var(--foreground)",
      },
      ".cm-lineNumbers .cm-gutterElement": {
        padding: "0 10px 0 12px",
        minWidth: "2.75rem",
      },
      ".cm-foldGutter .cm-gutterElement": {
        padding: "0 4px",
      },
      ".cm-tooltip": {
        backgroundColor: "var(--popover)",
        color: "var(--popover-foreground)",
        border: "1px solid var(--border)",
      },
      ".cm-tooltip-autocomplete": {
        "& > ul > li[aria-selected]": {
          backgroundColor: "var(--wiki-accent-muted)",
          color: "var(--foreground)",
        },
      },
      ".cm-panels": {
        backgroundColor: "var(--popover)",
        color: "var(--popover-foreground)",
      },
      ".cm-panels.cm-panels-top": {
        borderBottom: "1px solid var(--border)",
      },
      ".cm-searchMatch": {
        backgroundColor: "color-mix(in oklch, var(--wiki-link) 25%, transparent)",
        outline: "1px solid color-mix(in oklch, var(--wiki-link) 45%, transparent)",
      },
      ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: "color-mix(in oklch, var(--wiki-link) 40%, transparent)",
      },
    },
    { dark: false }
  );
}

const wikiMarkdownHighlightStyle = HighlightStyle.define([
  { tag: tags.heading, color: "var(--cm-heading-mark)", fontWeight: "500" },
  {
    tag: tags.heading1,
    color: "var(--cm-h1)",
    fontSize: "1.55em",
    fontWeight: "700",
  },
  {
    tag: tags.heading2,
    color: "var(--cm-h2)",
    fontSize: "1.38em",
    fontWeight: "700",
  },
  {
    tag: tags.heading3,
    color: "var(--cm-h3)",
    fontSize: "1.24em",
    fontWeight: "600",
  },
  {
    tag: tags.heading4,
    color: "var(--cm-h4)",
    fontSize: "1.12em",
    fontWeight: "600",
  },
  {
    tag: tags.heading5,
    color: "var(--cm-h5)",
    fontSize: "1.05em",
    fontWeight: "600",
  },
  {
    tag: tags.heading6,
    color: "var(--cm-h6)",
    fontSize: "1em",
    fontWeight: "600",
  },
  { tag: tags.strong, fontWeight: "700", color: "var(--foreground)" },
  { tag: tags.emphasis, fontStyle: "italic", color: "var(--cm-emphasis)" },
  { tag: tags.strikethrough, textDecoration: "line-through", color: "var(--muted-foreground)" },
  { tag: tags.link, color: "var(--wiki-link)", textDecoration: "underline" },
  { tag: tags.url, color: "var(--wiki-link)" },
  { tag: tags.monospace, color: "var(--cm-code)", backgroundColor: "var(--wiki-code-bg)" },
  { tag: tags.quote, color: "var(--cm-quote)", fontStyle: "italic" },
  { tag: tags.list, color: "var(--cm-list-marker)" },
  { tag: tags.meta, color: "var(--muted-foreground)" },
  { tag: tags.comment, color: "var(--muted-foreground)", fontStyle: "italic" },
  { tag: tags.keyword, color: "var(--cm-keyword)" },
  { tag: tags.string, color: "var(--cm-string)" },
  { tag: tags.number, color: "var(--cm-number)" },
  { tag: tags.bool, color: "var(--cm-keyword)" },
  { tag: tags.className, color: "var(--cm-type)" },
  { tag: tags.propertyName, color: "var(--cm-property)" },
  { tag: tags.tagName, color: "var(--cm-tag)" },
  { tag: tags.attributeName, color: "var(--cm-attribute)" },
  { tag: tags.contentSeparator, color: "var(--border)" },
]);

export const wikiMarkdownSyntaxHighlighting = syntaxHighlighting(
  wikiMarkdownHighlightStyle,
  { fallback: true }
);
