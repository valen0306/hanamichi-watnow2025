import { uploadImageToPostImages } from "./strage";

describe("uploadImageToPostImages", () => {
  it("uploads a PNG image and returns a public URL", async () => {
    // ダミー画像データ（1x1ピクセルのPNG）
    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBApUeJwAAAABJRU5ErkJggg==";
    const byteString = atob(base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: "image/png" });
    const fileName = `test_${Date.now()}.png`;

    const url = await uploadImageToPostImages(blob, fileName);
    expect(typeof url).toBe("string");
    expect(url).toMatch(/^https:\/\//);
  });
});
