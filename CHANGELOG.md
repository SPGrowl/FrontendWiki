# Changelog

每条记录对应一次有意义的设计决策或功能落地，按日期倒序排列。  
详细推导过程、面试复习材料等内部文档存在本地 `docs/`，不随仓库发布。

---

## 2026-08-18 — 完整起始 SQL + README 重写

- 新增 `db/schema.sql`：纯净建表脚本，不含存量迁移逻辑，适合新建库一次性执行。
- 重写 `README.md`：补充项目动机（前端知识分散、缺乏连贯心智模型）、坦率说明当前不足、分近中远列出后续方向。

---

## 2026-08-17 — 正文链接分类收敛 + 编辑页读模型三块化

**链接分类**

- 新增 `classifyMarkdownHref`（`lib/wiki/entry-slug.ts`）作为正文链接唯一入口，输出 `entry / external / invalid` 三类。
- 移除旧的 `isInternalEntryHref`、`normalizeInternalEntryHref`、`formatRawHref` 等分散函数。
- 约定：站内链必须是完整 `/entry/...`，含 `#` 或 `?` 的链接一律判为无效；页内跳转靠目录。
- `MarkdownLink`、`EntryLinkPreview`、`/api/entries/preview`、`lib/db/entries.ts` 同步切换。

**编辑页读模型**

- `getEntryEditBundleByHref` 一次装载三块：`metadata`（元数据）/ `currentVersion`（当前发布版）/ `draft`（用户最新草稿）。
- 草稿仅覆盖正文工作区，不再覆盖线上 `name / slug / parent_id`。
- 去掉 `?draft=` 查询参数依赖；旧 `getEntryEditPageData` 标为 deprecated。

---

## 2026-08-16 — 词条链接悬停预览设计定稿

- 预览触发：`href` 直接传给 `/api/entries/preview`，无需 `path` 字段。
- 时序：280ms 延迟打开 / 180ms 延迟关闭；模块级 `Map` 缓存，相同 href 不重复请求。
- 正文不认 `#` 锚点，预览 API 校验 href 合法性后直查 `entries.href`。
- 设计说明写入 `docs/dev/词条链接预览.md`。

---

## 2026-08-15 — 物化 `entries.href` 作为唯一阅读路径查询键

- `entries` 表新增 `href TEXT NOT NULL UNIQUE`（如 `/entry/js`、`/entry/blog/foo`）。
- 创建词条时由 `resolveEntryHref` 计算并写入；改 `slug / parent_id` 时 `cascadeEntryHrefs` 级联更新子孙，旧路径写入 `entry_slug_redirects`。
- 读取路径：先查 `entries.href`，miss 后查 `entry_slug_redirects.old_path`，均走 `loadEntryPageData`。
- 移除 UUID 兼容旧链（`/entry/blog/{uuid}`）——此为早期设计失误，直接删除。
- 迁移脚本：`db/migrate-entry-href.sql`；`db/init.sql` 含幂等补丁供已有库执行。

---

## 2026-08-14 — 词条 URL 明文契约

- `params.slug`（Next catch-all）只在进门处经 `hrefFromEntryParams` 做一次 `%` 解码，得到明文 href。
- 业务层只传递 Unicode 明文 href，彻底去掉 `encodeURIComponent` / `toDisplayEntryPath` 双形态。
- `buildBlogEntryHref / buildCommonHref / buildPreviewHref` 统一拼接明文路径。

---

## 2026-08-14 — 图库插入、正文图片缩放与个人相册

- 编辑器新增「插入图片」工具栏，打开 `ImageAssetPicker` 图库选图或当场上传。
- 缩放约定：`#scale=1~100` 写在 URL hash，`MarkdownImage` 渲染时解析为 `width: N%`，等比缩放。
- 配图 `title`（说明）必填；插入时写入 alt，阅读页用作图注。
- 个人主页右侧新增 `MyAlbum`，可上传、改说明、删除；删除时若为当前头像则清空头像字段。
- `lib/wiki/markdown-image.ts`：`parseMarkdownImageSrc / withMarkdownImageScale`。

---

## 2026-08-09 — Markdown 站内链接客户端跳转

- `MarkdownLink` 区分站内（`<Link>`）/ 外链（`<a target="_blank">`）/ 页内锚点（`<a>`）。
- `EntryContent` 注册 `components={{ a: MarkdownLink }}`，阅读页与编辑预览共用。

---

## 2026-08-09 — 词条编辑权限与元数据更新

- 权限分层：admin / 创建者可改 `name / slug / parent_id`（不写入版本历史）；普通用户只改正文（追加 `entry_versions`）。
- `PATCH /api/entries/:id`：元数据与正文可分别提交；仅元数据变更时不创建新版本。
- `canEditEntryMetadata(user, creatorId)` 统一判断元数据编辑权限。
