export default function EntryNotFound() {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-6 text-sm shadow-sm ring-1 ring-foreground/5">
      <h1 className="mb-2 text-xl font-bold">词条未找到</h1>
      <p className="text-muted-foreground">
        请检查 URL 是否正确，或返回首页浏览其他内容。
      </p>
    </div>
  );
}
