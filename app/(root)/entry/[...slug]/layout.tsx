export default function EntryReadLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-4 md:py-6">
      {children}
    </div>
  );
}
