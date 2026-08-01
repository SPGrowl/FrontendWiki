import Link from "next/link";
import type { IntroCard } from "@/lib/wiki/navigation-data";
import { WikiCard } from "./WikiCard";

interface IntroductionProps {
  cards: [IntroCard, IntroCard];
}

export function Introduction({ cards }: IntroductionProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row">
      {cards.map((card) => (
        <WikiCard key={card.title} className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{card.title}</h1>
          <p className="text-sm">
            {card.linkedTerm ? (
              <>
                <Link
                  href={card.linkedTerm.href}
                  className="text-blue-600 underline"
                >
                  {card.linkedTerm.label}
                </Link>
                {card.description}
              </>
            ) : (
              card.description
            )}
          </p>
        </WikiCard>
      ))}
    </div>
  );
}
