import { UserBlogList } from "@/components/wiki/user/UserBlogList";
import { UserContributionList } from "@/components/wiki/user/UserContributionList";
import { UserDraftList } from "@/components/wiki/drafts/user-draft-list";
import { AvatarUploader } from "@/components/wiki/user/avatar-uploader";
import { MyAlbum } from "@/components/wiki/user/my-album";
import { UserAvatar } from "@/components/wiki/user/user-avatar";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  listUserBlogs,
  listUserContributions,
} from "@/lib/db/entries";
import { listDraftsByUser } from "@/lib/db/drafts";
import { listMediaAssets } from "@/lib/db/media";
import { findUserById } from "@/lib/db/users";
import { notFound } from "next/navigation";

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;
  const user = await findUserById(id);

  if (!user) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isSelf = currentUser?.id === user.id;

  const [contributions, blogs, drafts, album] = await Promise.all([
    listUserContributions(user.id, 30),
    listUserBlogs(user.id, 30),
    isSelf ? listDraftsByUser(user.id) : Promise.resolve([]),
    isSelf
      ? listMediaAssets({
          purpose: "entry",
          uploaderId: user.id,
          limit: 12,
        })
      : Promise.resolve({ items: [], nextOffset: null }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-start">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 lg:mx-0 lg:flex-1">
        <div className="flex items-start gap-4">
          {isSelf ? (
            <AvatarUploader name={user.name} avatar={user.avatar} />
          ) : (
            <UserAvatar name={user.name} avatar={user.avatar} size="xl" />
          )}

          <div className="min-w-0 flex-1 pt-1">
            <h1 className="truncate text-xl font-semibold tracking-tight">
              {user.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSelf
                ? "这是你的个人主页 · 悬停头像可更换"
                : "用户主页"}
            </p>
          </div>
        </div>

        <UserContributionList items={contributions} />
        <UserBlogList items={blogs} />
        {isSelf ? <UserDraftList drafts={drafts} /> : null}
      </div>

      {isSelf ? (
        <div className="mx-auto w-full max-w-2xl shrink-0 lg:mx-0 lg:w-80">
          <MyAlbum
            initialItems={album.items}
            initialNextOffset={album.nextOffset}
          />
        </div>
      ) : null}
    </div>
  );
}
