export default function EntryGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col bg-wiki-surface px-4 md:px-6">
      {children}
    </div>
  );
}
