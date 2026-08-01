export default function EntryNotFound() {
  return (
    <div className="rounded border border-[#8d8d8d] bg-[#f6f9fa] p-6 text-sm">
      <h1 className="mb-2 text-xl font-bold">词条未找到</h1>
      <p className="text-muted-foreground">请检查 URL 是否正确，或返回首页浏览其他内容。</p>
    </div>
  );
}
