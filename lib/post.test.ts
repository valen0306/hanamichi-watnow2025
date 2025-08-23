import { createPostWithCaptionAndUserId, savePostImageInfo } from "./post";

describe("Post関連関数のテスト", () => {
  it("captionとuser_idでpost作成できる", async () => {
    const caption = "テスト投稿";
    const userId = "test-user-123";
    const post = await createPostWithCaptionAndUserId(caption, userId);
    expect(post).not.toBeNull();
    expect(post.caption).toBe(caption);
    expect(post.user_id).toBe(userId);
  });

  it("post_imagesテーブルに画像情報を保存できる", async () => {
    const imageUrl = "https://example.com/test.png";
    const lat = 35.6895;
    const lng = 139.6917;
    const postId = "test-post-id-123";
    const result = await savePostImageInfo(imageUrl, lat, lng, postId);
    expect(result).toBe(true);
  });
});
