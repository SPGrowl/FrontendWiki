import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { createMediaAsset } from "@/lib/db/media";
import { findUserById, updateUserAvatar } from "@/lib/db/users";
import {
  buildStorageKey,
  publicUrlForKey,
  writeUploadFile,
  deleteUploadFile,
} from "@/lib/media/storage";
import { validateUploadFormData } from "@/lib/media/validate-upload";
import type { ApiErrorResponse } from "@/type/api";
import type { MediaAssetPayload } from "@/type/media";

/**
 * POST /api/uploads
 * multipart: file, purpose=avatar|entry, title?=string, setAsAvatar?=1（仅 avatar）
 */
export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "请先登录后再上传" },
      { status: 401 }
    );
  }

  const user = await findUserById(userId);
  if (!user) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "用户不存在或会话已失效" },
      { status: 401 }
    );
  }

  let formData: FormData;
  try {
    // 解析请求体为 FormData 对象
    formData = await request.formData();
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { error: "请求体必须是 multipart/form-data" },
      { status: 400 }
    );
  }

  const validated = await validateUploadFormData(formData);
  if (!validated.ok) {
    return NextResponse.json<ApiErrorResponse>(
      { error: validated.error },
      { status: 400 }
    );
  }

  // 生成文件的URL
  const { purpose, mime, bytes, title } = validated.value;
  const storageKey = buildStorageKey(purpose, mime);
  const url = publicUrlForKey(storageKey);

  try {
    await writeUploadFile(storageKey, bytes);
  } catch (error) {
    console.error("[POST /api/uploads] write", error);
    return NextResponse.json<ApiErrorResponse>(
      { error: "保存文件失败" },
      { status: 500 }
    );
  }

  try {
    // 创建图片储存的回执
    const asset = await createMediaAsset({
      uploaderId: userId,
      url,
      storageKey,
      purpose,
      title,
      mime,
      sizeBytes: bytes.length,
    });

    const setAsAvatar =
      purpose === "avatar" &&
      (formData.get("setAsAvatar") === "1" ||
        formData.get("setAsAvatar") === "true");

    if (setAsAvatar) {
      await updateUserAvatar(userId, url);
    }

    // 返回图片储存的回执
    return NextResponse.json<MediaAssetPayload>({ asset }, { status: 201 });
  } catch (error) {
    await deleteUploadFile(storageKey).catch(() => undefined);
    console.error("[POST /api/uploads] db", error);
    return NextResponse.json<ApiErrorResponse>(
      { error: "登记媒体失败" },
      { status: 500 }
    );
  }
}
