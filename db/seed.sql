-- 可选种子数据（npm run db:init 会自动执行）
-- 固定 UUID 便于本地调试；重复执行使用 ON CONFLICT 跳过

BEGIN;

INSERT INTO users (id, name, password, role, avatar)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'System',
  '',
  'admin',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- JavaScript 词条
INSERT INTO entries (
  id, type, parent_id, slug, name, status, creator_id, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'common',
  NULL,
  'javascript',
  'JavaScript',
  'published',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO entry_versions (
  id, entry_id, version_no, title, content, contributor_id, message, created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000010',
  1,
  'JavaScript',
  $js$# JavaScript

## 介绍

**JavaScript**（简称 JS）是一种高级、解释型、多范式的编程语言。

## 语言特性

- **动态类型**
- **闭包**
- **原型链**
- **事件循环**
$js$,
  '00000000-0000-0000-0000-000000000001',
  'Initial import from placeholder data',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

UPDATE entries
SET current_version_id = '00000000-0000-0000-0000-000000000011',
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000010'
  AND current_version_id IS NULL;

-- TypeScript（与 JavaScript 同级）
INSERT INTO entries (
  id, type, parent_id, slug, name, status, creator_id, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000012',
  'common',
  NULL,
  'typescript',
  'TypeScript',
  'published',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO entry_versions (
  id, entry_id, version_no, title, content, contributor_id, message, created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000012',
  1,
  'TypeScript',
  $ts$## 概述

TypeScript 是 JavaScript 的超集，添加了静态类型系统。
$ts$,
  '00000000-0000-0000-0000-000000000001',
  'Initial import from placeholder data',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

UPDATE entries
SET current_version_id = '00000000-0000-0000-0000-000000000013',
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000012'
  AND current_version_id IS NULL;

-- ECMAScript（JavaScript 子级）
INSERT INTO entries (
  id, type, parent_id, slug, name, status, creator_id, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000014',
  'common',
  '00000000-0000-0000-0000-000000000010',
  'ecmascript',
  'ECMAScript',
  'published',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO entry_versions (
  id, entry_id, version_no, title, content, contributor_id, message, created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000015',
  '00000000-0000-0000-0000-000000000014',
  1,
  'ECMAScript',
  $es$## 概述

ECMAScript 是 JavaScript 的语言标准规范。
$es$,
  '00000000-0000-0000-0000-000000000001',
  'Initial import from placeholder data',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

UPDATE entries
SET current_version_id = '00000000-0000-0000-0000-000000000015',
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000014'
  AND current_version_id IS NULL;

-- Node.js（JavaScript 子级）
INSERT INTO entries (
  id, type, parent_id, slug, name, status, creator_id, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000016',
  'common',
  '00000000-0000-0000-0000-000000000010',
  'node-js',
  'Node.js',
  'published',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO entry_versions (
  id, entry_id, version_no, title, content, contributor_id, message, created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000017',
  '00000000-0000-0000-0000-000000000016',
  1,
  'Node.js',
  $node$## 概述

Node.js 是基于 V8 引擎的 JavaScript 运行时。
$node$,
  '00000000-0000-0000-0000-000000000001',
  'Initial import from placeholder data',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

UPDATE entries
SET current_version_id = '00000000-0000-0000-0000-000000000017',
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000016'
  AND current_version_id IS NULL;

-- React 19 词条（blog）
INSERT INTO entries (
  id, type, parent_id, slug, name, status, creator_id, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  'blog',
  NULL,
  'react-19-release',
  'React 19 正式版发布',
  'published',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO entry_versions (
  id, entry_id, version_no, title, content, contributor_id, message, created_at
)
VALUES (
  '00000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000020',
  1,
  'React 19 正式版发布',
  $react$# React 19 正式版发布

## 概述

React 19 于 2024 年底正式发布，带来了并发渲染增强、Server Actions 稳定版以及多项开发者体验改进。
$react$,
  '00000000-0000-0000-0000-000000000001',
  'Initial import from placeholder data',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

UPDATE entries
SET current_version_id = '00000000-0000-0000-0000-000000000021',
    updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000020'
  AND current_version_id IS NULL;

COMMIT;
