/**
 * DataURL（Base64）をBlobに変換する関数
 */
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * カメラで撮影した画像（dataURL）をSupabaseストレージにアップロードする例
 *
 * import { uploadImageToPostImages, dataURLtoBlob } from "./strage";
 *
 * const dataUrl = "data:image/png;base64,..."; // canvas.toDataURLの結果
 * const blob = dataURLtoBlob(dataUrl);
 * const fileName = `userId_${Date.now()}.png`;
 * const url = await uploadImageToPostImages(blob, fileName);
 * // urlがストレージ上の公開URL
 */
import { createClient } from "./supabase";

/**
 * 画像をSupabaseストレージのpost_imagesバケットにアップロードし、公開URLを返す
 * @param file 画像ファイル（Blob, File, Uint8Array など）
 * @param fileName 保存するファイル名（例: `${userId}_${Date.now()}.png`）
 */
export async function uploadImageToPostImages(file: Blob | File | Uint8Array, fileName: string): Promise<string | null> {
  const supabase = createClient();
  const bucket = "post_images";

  // 画像アップロード
  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: "image/png",
  });

  if (error) {
    console.error("画像アップロード失敗:", error.message);
    return null;
  }

  // 公開URL取得
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data?.publicUrl ?? null;
}
