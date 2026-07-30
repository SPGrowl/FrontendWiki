// wiki-main.tsx — Server
import { MetaCard } from "../card/MetaCard";
export  function MainContainer({ children }: { children: React.ReactNode }) {
    return (
      <>
      <main className="flex-1 flex justify-between min-w-0 gap-2 ">
  <div className="min-w-0 flex-2">{children}</div>
  <MetaCard />
      </main>
        </>
    );
  }
  export default function Main({ children }: { children: React.ReactNode }) {
    return (
        <main >
        </main>
    );
}