import { MainContainer } from "@/components/wiki/MainContainer/main";

export default function MainGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-y-auto bg-wiki-surface px-4 py-4 md:gap-6 md:px-6 md:py-6">
      <MainContainer>{children}</MainContainer>
    </div>
  );
}
