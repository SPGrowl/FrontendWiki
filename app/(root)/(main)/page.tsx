import { HomePageContent } from "@/components/wiki/HomePageContent";
import {
  listRecentBlogs,
  listRecentContributions,
} from "@/lib/db/entries";

export default async function RootPage() {
  const [blogs, contributions] = await Promise.all([
    listRecentBlogs(5),
    listRecentContributions(10),
  ]);

  return (
    <HomePageContent blogs={blogs} contributions={contributions} />
  );
}
