-- 在 psql 中连接 postgres 库后执行，或由 npm run db:init 自动处理
-- 用法: psql -U postgres -f db/00-create-database.sql

SELECT 'CREATE DATABASE frontend_wiki'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'frontend_wiki')\gexec
