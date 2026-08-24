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
  // 触发文件上传的事件
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  // 是否正在上传
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayAvatar = preview ?? avatar;

  // 提交文件
  async function handleFile(file: File | undefined) {
    if (!file || pending) return;

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    // 设置预览图
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
      // 刷新页面，更新顶栏等位置的头像
      router.refresh();
    } catch (err) {
      setPreview(null);
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setPending(false);
      URL.revokeObjectURL(objectUrl);
      // 清空文件选择框
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
        {/* 文件选择框 */}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={pending}
          // 文件列表变化时的回调
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
