import { MetaCard } from "../card/MetaCard";

export function MainContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row">
      <div className="min-w-0 flex-1">{children}</div>
      <aside className="w-full shrink-0 md:w-80">
        <MetaCard />
      </aside>
    </div>
  );
}
