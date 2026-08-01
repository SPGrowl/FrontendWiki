export default function EntryGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#e6eff4] px-4 py-2">
      {children}
    </div>
  );
}
