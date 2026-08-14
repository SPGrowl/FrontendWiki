import type { Metadata } from "next";
import Link from "next/link";
import { WikiCard } from "@/components/wiki/card/WikiCard";

export const metadata: Metadata = {
  title: "编辑规范",
};

export default function GuidelinesPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
      <WikiCard padding="lg">
        <h1 className="text-lg font-bold">编辑规范</h1>
        <div className="wiki-prose mt-4">
          <h2>正文格式</h2>
          <p>
            词条正文使用 Markdown 编写，支持标题、列表、表格、代码块与链接等常见语法。
          </p>

          <h2>图片</h2>
          <p>
            建议通过编辑器「插入图片」从图库选用，或自行上传后插入。目前约定：
            <strong>一张图片独占一行</strong>
            ，仅支持按原始宽高比等比缩放，不支持单独指定宽与高。
          </p>
          <p>基本语法：</p>
          <pre>
            <code>{`![说明文字](/uploads/entries/…/demo.webp#scale=75)`}</code>
          </pre>
          <ul>
            <li>
              <code>#scale=1</code>～<code>#scale=100</code>
              ：相对正文栏宽度的百分比（也可写成
              <code>#scale=75%</code>）。省略时使用默认展示宽度（不超过栏宽且有上限）。
            </li>
            <li>
              方括号中的说明文字会显示为图片下方的说明；请填写简洁、便于理解的描述。
            </li>
            <li>
              调整比例后，可在编辑页切换到「预览」查看效果，再改
              <code>#scale=</code> 后的数字即可。
            </li>
            <li>
              图库插入默认带 <code>#scale=75</code>
              ，可按需要改成更小或更大（最大 100）。
            </li>
          </ul>
          <p>示例：</p>
          <pre>
            <code>
              {`![架构概览](/uploads/entries/2026/08/abc.webp#scale=50)

后文继续写……`}
            </code>
          </pre>

          <h2>内容要求</h2>
          <ul>
            <li>新建词条时必须填写正文，不得提交空白内容。</li>
            <li>内容应准确、简洁，避免大段复制粘贴外站资料。</li>
            <li>代码示例需可理解，必要时补充简要说明。</li>
          </ul>

          <h2>编辑已有词条</h2>
          <p>
            进入词条阅读页后，可通过编辑入口修改内容。大幅改动建议在编辑说明中简要描述变更原因。
          </p>

          <p>
            准备好开始了吗？返回
            <Link href="/wiki/contribute" className="wiki-link mx-1">
              贡献页
            </Link>
            或
            <Link href="/entry/new" className="wiki-link mx-1">
              新建词条
            </Link>
            。
          </p>
        </div>
      </WikiCard>
    </div>
  );
}
