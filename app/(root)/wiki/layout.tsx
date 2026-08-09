export default function WikiPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl bg-wiki-surface px-4 py-4 md:px-6 md:py-6">
        {children}
      </div>
    </div>
  );
}
