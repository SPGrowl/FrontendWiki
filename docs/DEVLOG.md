# 开发日志

## 2026-08-15 — 物化 `entries.href` 作为唯一阅读路径查询键

### 背景

词条阅读页此前按 URL 拆 slug 后逐级 `parent_id + slug` 解析，博客与百科还要分支；完整路径只是运行时派生值，改父级/slug 时子孙 URL 与旧链都不好维护。业务上阅读身份本就是明文 `/entry/...`，应落成可索引、可唯一约束的查询键。

### 约定

- **树形保留**：`parent_id` + 本级 `slug` 仍组织父子与同级唯一
- **物化路径**：`entries.href`（如 `/entry/js/es6`、`/entry/blog/foo`）全局 `UNIQUE`，入库时写入
- **权威在服务端**：前端预览可拼 path；落库由 `resolveEntryHref(type, slug, parentHref)` 计算
- **面包屑暂不改**：仍走祖先链取各级 `name`；正文 `path` 直接用库内 `href`
- **不再兼容** `/entry/blog/{uuid}`（设计失误，已移除）

### 写入

- 创建：写入 `href`；唯一冲突提示更换别名或上级
- 改 slug / 父级：`cascadeEntryHrefs` 更新自身与全部子孙；旧 path 写入 `entry_slug_redirects`

### 读取

```
getEntryPageDataByHref
  1. entries.href 直查
  2. entry_slug_redirects.old_path
  → loadEntryPageData（面包屑仍 fetchEntryChain）
```

### 实现要点

```
db/migrate-entry-href.sql / db/init.sql / db/seed.sql
  entries.href NOT NULL + entries_href_unique；存量回填

lib/wiki/entry-path.ts
  resolveEntryHref(type, slug, parentHref)

lib/db/entries.ts
  createEntry / updateEntry + cascadeEntryHrefs
  getEntryPageDataByHref 按 href / redirects
  去掉 getBlogEntryPageData、UUID 旧链兜底

type/entry.ts
  Entry.href
```

### 迁移

已有库执行：`psql "$DATABASE_URL" -f db/migrate-entry-href.sql`

### 后续可选

- 面包屑改为祖先 `href` + `name` 一次查出，少一次 CTE（语义不变）
- 历史 / 讨论 / diff 的 `BySegments` 命名统一到 `ByHref` / `ByParams`

---

## 2026-08-14 — 词条 URL 明文契约（去掉业务层编解码）

### 背景

Next App Router 的 `params.slug` 对中文等非 ASCII 会原样给出 `%E9%99%88...`（实测确认），把 HTTP 传输细节泄漏进业务层。旧实现又在拼 path 时 `encodeURIComponent`、展示时再 `toDisplayEntryPath`，形成「编码 ↔ 解码」双形态，难读且易错。

前后端互相传递的 `path` / 面包屑 `href` / 预览链接本身用明文即可；浏览器会在线路上自动编码。

### 约定

- **规范形态**：明文 Unicode href，如 `/entry/陈年烂梗和语言宗教`、`/entry/html/dom`
- **唯一 decode**：`hrefFromEntryParams(params.slug)`——Next catch-all 进门洗一次
- **业务层不再 encode 词条 path**；`?next=` 等 query 值仍可 `encodeURIComponent`
- 语义上只谈 **完整 href** 与 **单体 slug**，不把「segment 数组」当成对外 API

### 实现要点

```
lib/wiki/entry-slug.ts
  hrefFromEntryParams        # params → 明文 href（唯一 % 处理）
  normalizeInternalEntryHref # 站内链接规范化
  blogSlugFromHref / commonSlugsFromHref  # 查库用，由明文 href 推导
  buildBlogEntryHref / buildCommonHref / buildPreviewHref  # 明文拼接
  validateSlug / resolveEntrySlug

lib/wiki/entry-path.ts
  EntryPathNode（原 EntryPathSegment）
  祖先链 → 明文 path / 面包屑；edit/history/discuss/diff 由 readPath 替换前缀

阅读 / 编辑页：params → hrefFromEntryParams → getEntryPageDataByHref
DB：getEntryPageDataByParams；getEntryPageDataBySegments 保留为 deprecated 别名
面包屑读模型：{ name, href, slug }（去掉 id）
创建预览：buildPreviewHref(parentHref, slug, type)，EntryPathPreview 只展示 href
```

### 验证

打开中文博客词条时，终端曾打印 `params.slug = ['blog', '%E9%99%88...']`；经 `hrefFromEntryParams` 后为明文 `/entry/blog/陈年烂梗和语言宗教`，查库命中。

### 后续可选

- 历史 / 讨论 / diff 路由命名从 `BySegments` 逐步改为 `ByParams`
- 删除 `BLOG_SEGMENT` / `EntryPathSegment` / `parseEntryHref` 等兼容别名

---

## 2026-08-14 — 图库选图、正文图片缩放与个人相册

### 背景

配图上传与媒体 API 已在前一日落地，但编辑器仍需手写 `![](/uploads/...)`，阅读页图片也没有统一的排版与缩放约定。个人主页缺少管理已上传配图的入口。

### 设计原则

- **插入走图库，不手拼 URL**：编辑器「插入图片」打开资源选择器，从已有 `purpose=entry` 资源中选用，或当场上传后再插入。
- **一张图独占一行、只做等比缩放**：不支持单独指定宽高；比例写在 URL hash，正文 Markdown 仍是普通图片语法。
- **说明即检索字段**：配图 `title`（上传时的 message）必填；插入时写入 `![alt]`，阅读页用作图下说明。
- **谁传谁管**：个人相册仅本人可见；改说明 / 删除与媒体 PATCH、DELETE 的「上传者或管理员」规则一致。

### 缩放约定

| 写法 | 含义 |
|------|------|
| `/uploads/....webp` | 未写 scale，走默认展示（栏宽内有上限） |
| `#scale=75` / `#scale=75%` | 相对正文栏宽度 75% |
| `#scale=1`～`#scale=100` | 合法范围，超出钳制 |

解析与写回：`lib/wiki/markdown-image.ts`（`parseMarkdownImageSrc` / `withMarkdownImageScale`）。图库插入默认 `#scale=75`。其它 hash 片段会保留在 `src` 上。

### 实现

```
lib/wiki/markdown-image.ts                    # scale 解析 / 写回
components/wiki/entry/markdown-image.tsx      # 阅读页 / 预览共用 <img>
components/wiki/entry/EntryContent.tsx        # components.img → MarkdownImage
components/wiki/editor/image-asset-picker.tsx # 编辑器图库弹层
components/wiki/editor/markdown-editor.tsx    # 工具栏「插入图片」
components/wiki/editor/markdown-merge-editor.tsx
components/wiki/editor/entry-editor-workspace.tsx
components/wiki/user/my-album.tsx             # 个人主页相册
app/(root)/user/[id]/page.tsx                 # 仅本人侧栏挂相册
app/(root)/wiki/guidelines/page.tsx           # 编辑规范：图片语法
lib/media/validate-upload.ts                  # entry 配图必须有说明
lib/db/stats.ts + MetaCard                    # 侧栏词条 / 博客 / 用户计数
```

**渲染**：`MarkdownImage` 用 `span.wiki-md-figure` 而非 `figure`，避免 `react-markdown` 把图片包在 `<p>` 里时出现非法嵌套。`alt` 非空时作为图注。请求地址去掉 `#scale=`，宽度用 inline `width: N%` + `height: auto`。

**图库插入**：`ImageAssetPicker` 列出当前用户配图、支持搜索与分页、本地预览后上传（必填说明）。确认后插入：

```markdown
![架构概览](/uploads/entries/…/abc.webp#scale=75)
```

**个人相册**：本人主页右侧 `MyAlbum`，可上传、改说明、删除。删除媒体时若该 URL 正是用户头像，会清空头像字段。

**规范页**：`/wiki/guidelines` 补充图片独占一行、`#scale=` 与图注约定。

**其它**：侧栏 `MetaCard` 改为展示已发布词条数、博客数、注册用户数（`getWikiStats`）。

### 作者写法示例

```markdown
![架构概览](/uploads/entries/2026/08/abc.webp#scale=50)

后文继续写……
```

### 后续可选

- 在预览里拖拽调整 scale 并写回 Markdown
- 相册与图库对「仍被词条引用」的图片给出引用提示后再删

---

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
