# Frontend Atlas

> 这是一个还在**持续成长中**的个人项目，作者是一名忙着找实习、准大四的前端菜鸟 🐣。  
> 开发周期比较仓促，也使用了大量 AI 进行具体实现，虽然我进行了设计和审查，代码里一定有不少写法不规范、设计前后不一致的地方，欢迎 issue 或 PR，**路过的大佬放过** 😋。  
> 项目会随着我的学习和工作经历不断迭代，后续会持续优化。

**Frontend Atlas（前端图鉴）**：一份活的、可协作的前端知识地图——用树形词条把分散的前端知识点重新组织起来。

仓库：[SPGrowl/Frontend-Atlas](https://github.com/SPGrowl/Frontend-Atlas)

---

## 为什么做这个

前端知识点分散在 MDN、各框架官方文档、掘金、博客等大量地方，很难按照一个连贯的心智模型来学习——**同一个概念可能需要翻五个网站才拼得出来**。

我想做一个地方，把这些碎片**重新用树形结构组织起来**：从语言核心到生态工具，从规范到实践；既能引用外部权威文档，又能加入自己的理解和踩坑记录。不是又一个文档镜像，而是**更像一份活的、可协作的前端知识地图**。

目前是纯个人在维护，内容以 JavaScript / TypeScript / React / Next.js 为主。

---

## 当前阶段

可本地自用的 **MVP 已闭环**（阅读、贡献、讨论、媒体、沙盒）。  
**还未做**：生产级部署、自动化测试、外链聚合、社区协作。

技术栈：Next.js 15（App Router / RSC）· React 19 · PostgreSQL · Tailwind CSS 4。

---

## 实现了什么

| 模块 | 状态 | 说明 |
|------|------|------|
| 百科阅读（TOC目录 / 面包屑 / 相关树 / 贡献者） | **可用** | 服务端按 `href` 装载，首屏不请求 |
| 博客（`/entry/blog/{slug}`） | **可用** | 与百科共用表与渲染 |
| 搜索 | **可用** | 顶栏，按名称模糊匹配 |
| 新建 / 编辑 / 草稿 / 发布 | **可用** | Merge 编辑器；草稿不覆盖线上元数据 |
| 历史 / 版本对比 | **可用** | append-only 版本表 |
| 讨论 | **可用** | 登录评论，作者或 admin 可删 |
| 站内链悬停预览 | **可用** | 280ms 开，模块级缓存 |
| 图库插入 / 个人相册 / 头像 | **可用** | MIME 魔数校验；配图说明必填 |
| JS 沙盒运行器 | **可用** | iframe + postMessage，不共享主站 origin |
| HTML Playground | **实验** | 可预览完整 HTML，拖拽分隔条 |
| 自动化测试 / CI | **未做** | — |
| 生产部署 | **未做** | 文件在本地 storage/ |

---

## 坦率说说不足

作者还是学生，写这个主要是边做边学，所以有些设计是**事后反思才意识到问题、边迭代边收**的：

- **没有单元测试**：靠手动跑和 TypeScript 类型兜，出了 bug 才知道。
- **搜索很简陋**：用的是 PostgreSQL `ILIKE`，只能按词条名匹配，正文全文搜索还没做。
- **权限模型简单**：只有 admin / user 两级，没有团队、订阅、细粒度权限。
- **媒体存本地**：不是对象存储，换机器就丢了，生产里不能这么搞。
- **内链质量没保证**：正文链接写错了运行时才知道是死链，没有编辑器内联验证。
- **迁移方案有点乱**：`init.sql` 里混了一些存量迁移补丁，新建库用 `db/schema.sql` 更干净，已有库要手动跑 `migrate-*.sql`，流程不够自动化。
- **代码里有一些 deprecated 遗留**：前期设计变化快，部分旧函数没来得及清，标了 `@deprecated` 还没删。
- 还有一些命名前后不统一、注释不完整的地方，等有时间慢慢收。

---

## 未来想做的方向

**近期（边用边改）**

- 清理代码里的 deprecated；统一命名；补注释。
- 编辑器里搜索并插入站内链（目前需要手写完整路径）。
- 死链高亮：正文里链了不存在的词条时给出视觉提示。

**中期（功能层面）**

- 正文全文搜索（PostgreSQL `tsvector` 或 Meilisearch）。
- 词条「参考来源」字段，统一管理外链引用。
- 阅读量统计（轻量，不引入分析平台）。
- 移动端阅读体验优化（目前响应式没细调）。
- 编辑历史可视化（diff 已有，想做个更直观的时间线）。

**长期（也许是愿景）**

- **内容整合**：能在词条里嵌入或引用外部文档片段，而不是单纯贴链接。
- **知识图谱**：词条之间的关系不只有父子，还有「相关」「前置知识」「参见」。
- **多人协作**：现在更像个人 wiki，多人同步编辑、review 机制还差得远。
- **个性化路径**：根据已读词条推荐下一步，给不同起点的人提供不同学习路线。

---

## 本地运行

前置：本机 PostgreSQL 已启动。

```bash
# 1. 配置环境变量
copy env.example .env.local
# 修改 .env.local 里的 DATABASE_URL 和 SESSION_SECRET

# 2. 安装依赖
npm install

# 3. 建库并初始化（会自动运行 init.sql + seed.sql）
npm run db:init

# 4. 确认连接
npm run db:check

# 5. 启动开发服务
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。  
种子管理员账号见 `db/seed.sql`，`db:init` 会写入默认密码。

**新建库可以用更干净的起始脚本：**

```bash
psql -U postgres -d frontend_wiki -f db/schema.sql
psql -U postgres -d frontend_wiki -f db/seed.sql  # 可选
```

`db/schema.sql` 是纯建表语句，不含存量迁移逻辑。

---

## 主要约定（维护时先看这里）

| 事项 | 约定 |
|------|------|
| 站内 href | 明文 `/entry/...`；仅路由进门处做 `%` 解码 |
| 正文链接分类 | 只认 `entry / external / invalid`，见 `classifyMarkdownHref` |
| href 落库 | 以后端计算为准；改 parent/slug 必须走 `cascadeEntryHrefs` |
| DB 访问 | 只在 Server Component / Route Handler，不进 Client |
| 图片缩放 | `#scale=1~100` 写在 URL hash，等比缩放 |

---

## 文档

| 文档 | 用途 |
|------|------|
| [CHANGELOG.md](./CHANGELOG.md) | 按日设计决策与改动摘要 |
| [db/schema.sql](./db/schema.sql) | 新建库完整建表脚本（干净版） |
| [db/README.md](./db/README.md) | 建库、迁移、媒体 API |

站点内：[编辑规范](http://localhost:3000/wiki/guidelines) · [参与贡献](http://localhost:3000/wiki/contribute)

---

## 目录速览

```
app/                 # 路由与 API
components/wiki/     # 阅读、编辑、顶栏、用户
components/tools/    # JS Runner / HTML Playground
lib/db/              # 读模型与写入（权威层）
lib/wiki/            # href / Markdown / 代码围栏
lib/auth/            # 会话与权限
lib/media/           # 上传校验与存储
db/                  # schema.sql / init.sql / migrate-*.sql / seed.sql
docs/                # 开发与复习文档（本地私有，未进仓库）
```

---

*持续更新中 · 欢迎 star / issue / 轻拍* 🙏
