export default function EntryGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 bg-wiki-surface px-4 md:px-6">
      {children}
    </div>
  );
}
