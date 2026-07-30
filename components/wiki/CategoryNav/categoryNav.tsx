// wiki-category-nav.tsx — Server
// No event,use default server component
import Link from "next/link";
interface Category {
    content: string;
    href: string;
    label: string;
    icon?:string;
}
export function CategoryNav({
    categories,
    activeSlug,
  }: {
    categories: Category[];
    activeSlug: string;
  }) {
    return (
      <nav aria-label="Wiki categories"  className="flex  gap-1 justify-between">
        {categories.map((cat) => (
          <Link
            key={cat.content}
            href={cat.href}
            aria-current={cat.content === activeSlug ? "page" : undefined}
            data-active={cat.content === activeSlug}
            className="border border-black  py-2 text-center text-black hover:bg-[#f0f7e6] hover:text-[#2e5a18] flex-1"
            >
            
            {cat.label}
          </Link>
        ))}
      </nav>
    );
  }