# 开发日志

## 2026-08-09 — Markdown 站内链接跳转

### 背景

词条正文以 Markdown 存储，阅读页与编辑预览均通过 `EntryContent` + `react-markdown` 渲染。此前链接使用默认 HTML `<a>`，站内 `/entry/...` 虽可跳转，但会触发整页刷新，且未区分外链行为。

### 设计原则

- **以 `href` 为唯一标准**：作者写 `[显示文字](/entry/javascript/es6)`，渲染与跳转只认完整路径，不用词条名或 slug 反查。
- **站内用 Next.js `Link`**：客户端路由，避免整页刷新。
- **外链仍用 `<a>`**：`target="_blank"` + `rel="noopener noreferrer"`。
- **页内锚点**（`#heading`）保持原生 `<a>`。

### 链接分类

| href 形式 | 渲染 | 行为 |
|-----------|------|------|
| `/entry`、`/entry/...` | `<Link href="...">` | 站内客户端跳转 |
| `https://...`、`//...` | `<a target="_blank">` | 新标签打开 |
| `#anchor` | `<a href="#...">` | 页内滚动 |
| 其他 | `<a href="...">` | 浏览器默认 |

### 实现

```
lib/wiki/resolve-entry-link.ts     # isInternalEntryHref / isExternalHref
components/wiki/entry/markdown-link.tsx   # Client Component，components.a 映射
components/wiki/entry/EntryContent.tsx    # 注册 markdownComponents.a
```

`MarkdownLink` 为 Client Component（依赖 `next/link`），由服务端 `EntryContent` 引用；`react-markdown` 的 `components={{ a: MarkdownLink }}` 对所有 Markdown 链接生效，包括：

- 词条阅读页（`WikiEntry`）
- 编辑页右侧预览（`EntryEditorWorkspace`）

### 作者写法示例

```markdown
详见 [ES 模块](/entry/javascript/es-modules)。

外部参考：[MDN](https://developer.mozilla.org)。
```

### 后续可选

- 词条页「复制 Markdown 链接」按钮
- 编辑器内链补全（搜索 API 插入完整 href）
- 渲染前校验 href 是否存在（死链样式）

---

## 2026-08-09 — 词条编辑权限与元数据更新

### 需求

- **管理员**与**词条创建者**：可修改名称、URL 别名（slug）、上级词条；修改不写入版本历史。
- **普通登录用户**：仅可修改正文；正文变更仍追加 `entry_versions` 新版本。

### 权限

`lib/auth/entry-permissions.ts`：`canEditEntryMetadata(user, creatorId)`，`role === 'admin'` 或 `user.id === creatorId`。

### 后端

`PATCH /api/entries/:id` 请求体：

```typescript
{
  content: string;      // 必填
  name?: string;        // 仅元数据编辑者
  slug?: string;
  parentId?: string | null;
}
```

`updateEntry` 逻辑：

1. **元数据**（name / slug / parent_id）：直接 `UPDATE entries`；若 name 变更，同步 `UPDATE` 当前版本的 `title`（原地修改，不新增 version_no）；校验 slug 唯一、父级非自身/子孙。
2. **正文**：与当前版本 content 不同时 `INSERT entry_versions`，并更新 `current_version_id`。
3. 仅元数据变更时也可保存，不创建新版本。

### 前端

`EntryEditEditor` 根据 `canEditMetadata` 展示/禁用名称、slug、`ParentEntryPicker`；普通用户名称只读。`getEntryEditPageData` 提供编辑页所需元数据与当前父词条。
