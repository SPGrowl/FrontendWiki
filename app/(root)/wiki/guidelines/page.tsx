import type { Metadata } from "next";
import Link from "next/link";
import { WikiCard } from "@/components/wiki/card/WikiCard";
import { MarkdownSample } from "@/components/wiki/guidelines/markdown-sample";
import {
  MARKDOWN_IMAGE_DEFAULT_SCALE,
  MARKDOWN_IMAGE_SCALE_MAX,
  MARKDOWN_IMAGE_SCALE_MIN,
} from "@/lib/wiki/markdown-image";

export const metadata: Metadata = {
  title: "编辑规范",
};

const SAMPLE_HEADINGS = `## 概述

词条标题由系统渲染，正文从二级标题写起。

### 语言特性

闭包会「记住」定义时的作用域。

#### 常见误区

不要把循环变量直接放进异步回调。`;

const SAMPLE_INLINE = `段落里可以用 **加粗**、*斜体* 和 \`const x = 1\` 行内代码。

> 引用适合放定义或注意事项。

站内词条用完整路径：
[JavaScript](/entry/js)

外链会在新标签打开：
[MDN](https://developer.mozilla.org/)

省略首斜杠无效：[js](entry/js)
带页内锚点无效：[概述](#概述)`;

const SAMPLE_LISTS = `- 无序列表
- 第二项
  - 可嵌套

1. 有序列表
2. 按步骤写操作说明`;

const SAMPLE_TABLE = `| API | 作用 | 备注 |
| --- | --- | --- |
| \`map\` | 映射新数组 | 不改原数组 |
| \`filter\` | 按条件筛选 | 回调返回真值保留 |`;

const SAMPLE_CODE = `安装依赖后启动开发服务：

\`\`\`bash
npm install
npm run dev
\`\`\`

JavaScript 示例（阅读页可复制，符合条件时可送进运行器）：

\`\`\`js
const doubled = [1, 2, 3].map((n) => n * 2);
console.log(doubled);
\`\`\``;

const SAMPLE_IMAGES = `![示意图（未写 scale，走默认宽度）](/guidelines/scale-demo.svg)

![示意图（栏宽 50%）](/guidelines/scale-demo.svg#scale=50)`;

const toc = [
  { href: "#headings", label: "标题层级" },
  { href: "#markdown", label: "常用语法" },
  { href: "#images", label: "图片与缩放" },
  { href: "#content", label: "内容要求" },
  { href: "#edit", label: "编辑已有词条" },
] as const;

export default function GuidelinesPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 md:gap-6">
      <WikiCard padding="lg">
        <h1 className="text-lg font-bold">编辑规范</h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          词条正文使用 Markdown（含
          GFM：表格、删除线、任务列表等）。阅读页与编辑预览共用同一套渲染，下面左侧是写法，右侧是实际效果。
        </p>
        <nav aria-label="本页目录" className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {toc.map((item) => (
            <a key={item.href} href={item.href} className="wiki-link">
              {item.label}
            </a>
          ))}
        </nav>
      </WikiCard>

      <WikiCard padding="lg" as="article">
        <section id="headings" className="scroll-mt-24">
          <h2 className="text-base font-bold">标题层级</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">
            页面主标题来自词条名称，阅读页已经渲染为
            <code className="rounded bg-wiki-code-bg px-1 py-0.5 text-[0.8125rem]">
              {"<h1>"}
            </code>
            。正文不要再写一级标题，从 <code className="rounded bg-wiki-code-bg px-1 py-0.5 text-[0.8125rem]">##</code> 开始，并按层级递进，方便左侧目录跳转。
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-border bg-wiki-code-bg px-3 py-1.5 text-left font-medium">
                    写法
                  </th>
                  <th className="border border-border bg-wiki-code-bg px-3 py-1.5 text-left font-medium">
                    对应
                  </th>
                  <th className="border border-border bg-wiki-code-bg px-3 py-1.5 text-left font-medium">
                    建议
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-3 py-1.5">
                    <code># 标题</code>
                  </td>
                  <td className="border border-border px-3 py-1.5">h1</td>
                  <td className="border border-border px-3 py-1.5 text-muted-foreground">
                    不要用。与词条名重复，也不会出现在目录里
                  </td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-1.5">
                    <code>## 概述</code>
                  </td>
                  <td className="border border-border px-3 py-1.5">h2</td>
                  <td className="border border-border px-3 py-1.5">
                    正文大节，目录第一层
                  </td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-1.5">
                    <code>### 细节</code>
                  </td>
                  <td className="border border-border px-3 py-1.5">h3</td>
                  <td className="border border-border px-3 py-1.5">
                    大节下的小节
                  </td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-1.5">
                    <code>#### 补充</code>
                  </td>
                  <td className="border border-border px-3 py-1.5">h4</td>
                  <td className="border border-border px-3 py-1.5">
                    少用；不要从 h2 直接跳到 h4
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="mt-4 list-disc pl-6 text-sm leading-relaxed text-foreground/80">
            <li>同一词条里标题尽量不重复。重复时目录锚点会自动加 <code className="rounded bg-wiki-code-bg px-1 py-0.5 text-[0.8125rem]">-1</code>、<code className="rounded bg-wiki-code-bg px-1 py-0.5 text-[0.8125rem]">-2</code>。</li>
            <li>标题写清楚主题即可，不必在标题里堆链接或图片。</li>
          </ul>
          <MarkdownSample source={SAMPLE_HEADINGS} />
        </section>

        <section id="markdown" className="mt-10 scroll-mt-24">
          <h2 className="text-base font-bold">常用语法</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">
            强调、引用、列表、表格、代码块与链接均可直接使用。站内词条必须写完整路径
            <code className="rounded bg-wiki-code-bg px-1 py-0.5 text-[0.8125rem]">
              /entry/...
            </code>
            ，与库中阅读路径一致。不要省略首斜杠，不要带
            <code className="rounded bg-wiki-code-bg px-1 py-0.5 text-[0.8125rem]">
              #
            </code>
            或查询串；页内跳转请用左侧目录。需要指向更细主题时，链到子词条而不是
            <code className="rounded bg-wiki-code-bg px-1 py-0.5 text-[0.8125rem]">
              /entry/js#闭包
            </code>
            。不合规则的链接会显示为无效。悬停规范站内链可预览摘要。
          </p>
          <MarkdownSample source={SAMPLE_INLINE} />
          <MarkdownSample source={SAMPLE_LISTS} />
          <MarkdownSample source={SAMPLE_TABLE} />
          <MarkdownSample source={SAMPLE_CODE} />
        </section>

        <section id="images" className="mt-10 scroll-mt-24">
          <h2 className="text-base font-bold">图片插入与缩放</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">
            建议用编辑器工具栏「插入图片」从图库选用或当场上传。约定：
            <strong>一张图独占一行</strong>
            ，只按原始宽高比等比缩放，不能单独指定宽和高。
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">
            基本语法：
          </p>
          <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-wiki-code-bg p-3 text-[13px] leading-relaxed">
            <code>{`![说明文字](/uploads/entries/…/demo.webp#scale=${MARKDOWN_IMAGE_DEFAULT_SCALE})`}</code>
          </pre>
          <ul className="mt-4 list-disc pl-6 text-sm leading-relaxed text-foreground/80">
            <li>
              <code className="rounded bg-wiki-code-bg px-1 py-0.5 text-[0.8125rem]">
                #scale={MARKDOWN_IMAGE_SCALE_MIN}
              </code>
              ～
              <code className="rounded bg-wiki-code-bg px-1 py-0.5 text-[0.8125rem]">
                #scale={MARKDOWN_IMAGE_SCALE_MAX}
              </code>
              ：相对正文栏宽度的百分比（也可写成
              <code className="rounded bg-wiki-code-bg px-1 py-0.5 text-[0.8125rem]">
                #scale=75%
              </code>
              ）。省略时使用默认展示宽度（栏宽内有上限，不会撑满整栏）。
            </li>
            <li>
              <code className="rounded bg-wiki-code-bg px-1 py-0.5 text-[0.8125rem]">
                #scale
              </code>{" "}
              只能单独使用，且必须为 1～100；写错、越界或写了其它 hash 时，按未指定比例处理（默认展示宽度，不是图库插入的 75%）。
            </li>
            <li>
              方括号中的说明会显示为图下注释，也会作为检索用的配图说明；请写简洁、能看懂的描述。
            </li>
            <li>
              图库插入默认带{" "}
              <code className="rounded bg-wiki-code-bg px-1 py-0.5 text-[0.8125rem]">
                #scale={MARKDOWN_IMAGE_DEFAULT_SCALE}
              </code>
              。改数字后切到编辑页「预览」即可核对。
            </li>
            <li>不要把多张图写在同一行，也不要在标题里插图。</li>
          </ul>
          <MarkdownSample source={SAMPLE_IMAGES} />
        </section>

        <section id="content" className="mt-10 scroll-mt-24">
          <h2 className="text-base font-bold">内容要求</h2>
          <ul className="mt-3 list-disc pl-6 text-sm leading-relaxed text-foreground/80">
            <li>新建词条必须填写正文，不得提交空白内容。</li>
            <li>内容应准确、简洁，避免大段复制外站资料；需要出处时用外链标明。</li>
            <li>代码示例应可理解，必要时在块前用一两句话说明在做什么。</li>
            <li>百科词条用层级 slug 组织；博客固定在 <code className="rounded bg-wiki-code-bg px-1 py-0.5 text-[0.8125rem]">/entry/blog/别名</code>。</li>
          </ul>
        </section>

        <section id="edit" className="mt-10 scroll-mt-24">
          <h2 className="text-base font-bold">编辑已有词条</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">
            打开词条阅读页后，用工具栏「编辑」修改。大幅改动请在提交说明里写清原因。改 URL
            别名或上级词条会更新整条路径，旧链接会尽量重定向到新地址。
          </p>
          <p className="mt-4 text-sm leading-relaxed text-foreground/80">
            准备好了？返回
            <Link href="/wiki/contribute" className="wiki-link mx-1">
              贡献页
            </Link>
            或
            <Link href="/entry/new" className="wiki-link mx-1">
              新建词条
            </Link>
            。
          </p>
        </section>
      </WikiCard>
    </div>
  );
}
