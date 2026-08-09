export default function EditEntryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="py-2 md:py-3">{children}</div>;
}
