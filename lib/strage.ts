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
  console.log("uploadImageToPostImages called with fileName:", fileName);
  try {
    console.log("[LOG] uploadImageToPostImages: tryブロック開始");
    const supabase = createClient();
    const bucket = "post_images";
    console.log("Uploading to bucket:", bucket);

    // 画像アップロード
    const { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: "image/png",
    });
    console.log("[LOG] uploadImageToPostImages: upload APIレスポンス", { uploadData, uploadError });

    if (uploadError) {
      console.error("画像アップロード失敗 (uploadError):", JSON.stringify(uploadError, null, 2));
      alert(`画像アップロード失敗: ${uploadError.message}\n詳細: ${JSON.stringify(uploadError, null, 2)}`);
      return null;
    }
    if (!uploadData) {
      console.error("画像アップロード失敗: uploadDataがnullです");
      alert("画像アップロード失敗: uploadDataがnullです");
      return null;
    }

    // 公開URL取得
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    console.log("[LOG] uploadImageToPostImages: getPublicUrl APIレスポンス", { urlData });
    if (!urlData || !urlData.publicUrl) {
      console.error("公開URL取得失敗: urlDataがnullです", JSON.stringify(urlData, null, 2));
      alert("公開URL取得失敗: urlDataがnullです\n詳細: " + JSON.stringify(urlData, null, 2));
      return null;
    }
    console.log("[LOG] uploadImageToPostImages: 正常終了 publicUrl=", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (err) {
    console.log("[LOG] uploadImageToPostImages: catchブロック到達");
    if (err instanceof Error) {
      console.error("画像アップロード例外 (Error):", err.name, err.message, err.stack);
      alert(`画像アップロード例外: ${err.name}\n${err.message}`);
    } else {
      console.error("画像アップロード例外 (unknown):", JSON.stringify(err, null, 2));
      alert("画像アップロード例外: " + JSON.stringify(err, null, 2));
    }
    return null;
  }
}

// Supabaseストレージのpost_imagesバケットから指定ファイル名の公開URLを取得する関数


export function getPostImagePublicUrl(fileName: string): string | null {
  try {
    const supabase = createClient();
    const bucket = "post_images";
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    if (!data || !data.publicUrl) {
      console.error("公開URL取得失敗: dataがnullです", JSON.stringify(data, null, 2));
      return null;
    }
    return data.publicUrl;
  } catch (err) {
    console.error("公開URL取得例外:", err);
    return null;
  }
}
