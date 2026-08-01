export interface WikiEntryData {
  id: string;
  title: string;
  content: string;
}

const entries: Record<string, WikiEntryData> = {
  javascript: {
    id: "javascript",
    title: "JavaScript",
    content: `# JavaScript

## 介绍

**JavaScript**（简称 JS）是一种高级、解释型、多范式的编程语言，由网景公司的布兰登·艾克于 1995 年创造，最初命名为 LiveScript，后更改为现名。其语法标准由 Ecma 国际的 TC39 委员会维护，称为 [ECMAScript](https://tc39.es/)。

JavaScript 具备动态类型、基于原型的对象模型和一等函数，支持事件驱动、函数式、面向对象及指令式编程风格。

## 历史

- 1995 年：Brendan Eich 在网景公司 10 天内完成首版实现
- 1997 年：ECMA 发布 ECMAScript 1 标准
- 2009 年：ECMAScript 5 引入严格模式
- 2015 年：ECMAScript 2015（ES6）引入类、模块、箭头函数等

### 命名由来

最初命名为 **LiveScript**，为营销考虑更名为 JavaScript，与 Java 语言并无直接关系。

## 运行环境

作为万维网的核心技术之一，JavaScript 与 HTML 和 CSS 共同构成现代网页的基石。

| 环境 | 代表 | 用途 |
| --- | --- | --- |
| 浏览器 | Chrome V8、Firefox SpiderMonkey | 网页交互 |
| 服务端 | Node.js、Deno、Bun | 后端 API、CLI |
| 移动端 | React Native | 跨平台应用 |
| 桌面端 | Electron | 桌面应用 |

## 语言特性

### 核心概念

- **动态类型**：变量类型在运行时确定
- **闭包**：函数可捕获外部作用域变量
- **原型链**：对象继承的核心机制
- **事件循环**：异步编程的基础模型

### ES2015 以来的重要特性

1. \`let\` / \`const\` 块级作用域
2. 箭头函数与解构赋值
3. Promise 与 async/await
4. 模块系统（import / export）
5. 可选链（\`?.\`）与空值合并（\`??\`）

## 生态系统

- **框架**：React、Vue.js、Angular、Svelte
- **构建工具**：Vite、Webpack、esbuild
- **类型系统**：TypeScript（JavaScript 的超集）
- **包管理**：npm、pnpm、yarn

## 轶事

- JavaScript 最初开发仅用了约 **10 天**
- 名字中的 "Java" 是营销策略，两语言语法差异很大
- V8 引擎的 JIT 编译使 JavaScript 性能接近原生代码
- TC39 每年发布一个新 ECMAScript 版本
`,
  },
  "react-19-release": {
    id: "react-19-release",
    title: "React 19 正式版发布",
    content: `# React 19 正式版发布

## 概述

React 19 于 2024 年底正式发布，带来了并发渲染增强、Server Actions 稳定版以及多项开发者体验改进。

## 新特性

### Server Actions

Server Actions 允许在组件中直接定义服务端函数，无需手动创建 API 路由：

\`\`\`tsx
async function createTodo(formData: FormData) {
  "use server";
  await db.todo.create({ data: { title: formData.get("title") } });
}
\`\`\`

### Actions 与表单

原生 \`<form>\` 元素可直接绑定 Server Action，支持渐进增强。

### \`use\` Hook

新增 \`use\` API，可在渲染过程中读取 Promise 或 Context。

## 并发特性

- 自动批处理范围扩大
- Suspense 边界改进
- \`useTransition\` 与 \`useDeferredValue\` 性能优化

## 迁移指南

1. 升级 \`react\` 和 \`react-dom\` 至 19.x
2. 替换已废弃的 \`ReactDOM.render\` 为 \`createRoot\`
3. 检查第三方库兼容性
4. 参考[官方升级指南](https://react.dev/blog/2024/12/05/react-19)

## 相关词条

- [JavaScript](/entry/javascript)
`,
  },
};

export async function getEntryById(id: string): Promise<WikiEntryData | null> {
  return entries[id] ?? null;
}

export function getAllEntryIds(): string[] {
  return Object.keys(entries);
}
