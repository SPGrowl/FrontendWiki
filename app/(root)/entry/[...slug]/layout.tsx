export default function EntryReadLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto py-4 md:py-6">{children}</div>
  );
}
