import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserDraftList } from "@/components/wiki/drafts/user-draft-list";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { listDraftsByUser } from "@/lib/db/drafts";
import { findUserById } from "@/lib/db/users";

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
  const drafts = isSelf ? await listDraftsByUser(user.id) : [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6 md:p-8">
      <div className="flex items-start gap-4">
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar}
            alt=""
            className="size-16 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-16 items-center justify-center rounded-full bg-muted text-xl font-semibold uppercase"
          >
            {user.name.slice(0, 1)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight">
            {user.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSelf ? "这是你的个人主页" : "用户主页"}
          </p>
        </div>
      </div>

      {isSelf ? (
        <UserDraftList drafts={drafts} />
      ) : (
        <div className="rounded-none border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
          仅本人可见草稿箱与贡献记录。
        </div>
      )}

      {!currentUser ? (
        <Button render={<Link href="/auth/login" />} nativeButton={false}>
          登录以编辑资料
        </Button>
      ) : null}
    </div>
  );
}
