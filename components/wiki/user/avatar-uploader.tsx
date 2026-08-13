"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraIcon } from "@phosphor-icons/react";
import { UserAvatar } from "@/components/wiki/user/user-avatar";
import { uploadMedia } from "@/lib/api/media";
import { cn } from "@/lib/utils";

interface AvatarUploaderProps {
  name: string;
  avatar: string;
}

export function AvatarUploader({ name, avatar }: AvatarUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayAvatar = preview ?? avatar;

  async function handleFile(file: File | undefined) {
    if (!file || pending) return;

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setPending(true);

    try {
      await uploadMedia({
        file,
        purpose: "avatar",
        title: `${name} 的头像`,
        setAsAvatar: true,
      });
      setPreview(null);
      router.refresh();
    } catch (err) {
      setPreview(null);
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setPending(false);
      URL.revokeObjectURL(objectUrl);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div className="relative size-16">
        <UserAvatar name={name} avatar={displayAvatar} size="xl" />
        <button
          type="button"
          disabled={pending}
          aria-label="更换头像"
          title="更换头像（JPEG/PNG/WebP/GIF，≤2MB）"
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full",
            "bg-black/0 text-white opacity-0 transition-opacity",
            "hover:bg-black/45 hover:opacity-100 focus-visible:bg-black/45 focus-visible:opacity-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            pending && "pointer-events-none bg-black/45 opacity-100"
          )}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? (
            <span className="text-[10px] font-medium">上传中</span>
          ) : (
            <CameraIcon className="size-6" weight="bold" aria-hidden />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={pending}
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
          }}
        />
      </div>
      {error ? (
        <p
          className="max-w-16 text-center text-[10px] leading-tight text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
