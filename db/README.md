# 数据库初始化

## 前置条件

- 已安装 PostgreSQL（本地服务运行中）
- 默认账号：`postgres` / `postgres`（若用户名是 `postgre`，请修改连接串）

## 1. 配置环境变量

```bash
copy env.example .env.local
```

`.env.local` 示例：

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/frontend_wiki
```

## 2. 安装依赖

```bash
npm install
```

## 3. 初始化数据库与表结构

自动创建 `frontend_wiki` 库并执行 `init.sql`：

```bash
npm run db:init
```

或手动：

```bash
# 创建数据库（可选，脚本会自动创建）
psql -U postgres -f db/00-create-database.sql

# 建表
psql -U postgres -d frontend_wiki -f db/init.sql
```

## 4. 检查连接

```bash
npm run db:check
```

## 表结构

| 表 | 说明 |
|----|------|
| `users` | 用户 |
| `entries` | 词条元数据（`type`: common / blog；blog 路径 `/entry/blog/{slug}`） |
| `entry_versions` | 版本快照（append-only） |
| `entry_slug_redirects` | slug 重定向 |
| `entry_drafts` | 用户私有草稿（每词条可多条） |
| `entry_comments` | 词条讨论 |
| `media_assets` | 上传图片元数据（文件在 `storage/uploads/`） |

### 已有库迁移（blog slug 命名空间）

若库是旧版 `entries_root_slug_unique`（common/blog 共用根 slug），执行：

```bash
psql -U postgres -d frontend_wiki -f db/migrate-blog-slug-namespace.sql
```

### 已有库迁移（媒体图库）

```bash
psql -U postgres -d frontend_wiki -f db/migrate-media-assets.sql
```

或重新执行 `npm run db:init`（`init.sql` 已含该表，幂等）。

## 媒体上传 API（摘要）

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/uploads` | multipart：`file` + `purpose=avatar\|entry`；可选 `title`、`setAsAvatar` |
| `GET` | `/api/media` | 图库列表：`purpose` / `uploaderId` / `q` / `offset` / `limit` |
| `PATCH` | `/api/media/:id` | 改 `title`（上传者或 admin） |
| `DELETE` | `/api/media/:id` | 删记录与文件（上传者或 admin） |
| `GET` | `/uploads/...` | 读取已上传文件 |
| `GET/PATCH` | `/api/me` | 当前用户；`PATCH` 可设 `avatar` 为本站 `/uploads/avatar/...` |

## 代码中使用

```typescript
import { query, testConnection } from "@/lib/db";

const ok = await testConnection();
const { rows } = await query("SELECT id, name FROM users LIMIT 10");
```

仅在 **Server Component / Route Handler / Server Action** 中调用，不要引入客户端组件。
