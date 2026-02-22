'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Trash2, Edit } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentCountChange: (count: number) => void;
}

interface CommentWithUsername {
  post_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  username: string;
}

export function CommentSection({ 
  postId, 
  currentUserId, 
  isOpen, 
  onClose, 
  onCommentCountChange 
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithUsername[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // コメント一覧を取得（モック）
  const fetchComments = async () => {
    try {
      console.log('モックコメント取得開始:', { postId });
      
      // モックコメントデータを生成
      const mockComments: CommentWithUsername[] = [
        {
          post_id: postId,
          user_id: 'user1',
          comment: '素敵な投稿ですね！',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分前
          username: 'user1'
        },
        {
          post_id: postId,
          user_id: 'user2',
          comment: 'とても良い写真です',
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15分前
          username: 'user2'
        }
      ];
      
      console.log('モックコメント生成完了:', mockComments);
      setComments(mockComments);
      onCommentCountChange(mockComments.length);
    } catch (error) {
      console.error('モックコメント取得エラー:', error);
      setComments([]);
      onCommentCountChange(0);
    }
  };

  // コメントを追加（モック）
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log('モックコメント投稿開始:', { postId, currentUserId, commentText: newComment.trim() });
      
      // 100msの遅延をシミュレート
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 新しいコメントをモックで作成
      const newMockComment: CommentWithUsername = {
        post_id: postId,
        user_id: currentUserId,
        comment: newComment.trim(),
        created_at: new Date().toISOString(),
        username: 'current_user'
      };
      
      console.log('モックコメント作成完了:', newMockComment);
      
      // コメントリストに追加
      setComments(prev => [newMockComment, ...prev]);
      setNewComment('');
      
      // コメント数を更新
      onCommentCountChange(prev => prev + 1);
      
    } catch (error) {
      console.error('モックコメント投稿エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // コメントを削除（モック）
  const handleDeleteComment = async (comment: CommentWithUsername) => {
    try {
      console.log('モックコメント削除開始:', comment);
      
      // 100msの遅延をシミュレート
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // コメントリストから削除
      setComments(prev => prev.filter(c => c !== comment));
      
      // コメント数を更新
      onCommentCountChange(prev => Math.max(0, prev - 1));
      
      console.log('モックコメント削除完了');
    } catch (error) {
      console.error('モックコメント削除エラー:', error);
    }
  };

  // コメント編集開始
  const handleStartEdit = (comment: CommentWithUsername) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.comment_text);
  };

  // コメント編集完了（モック）
  const handleFinishEdit = async (comment: CommentWithUsername) => {
    try {
      console.log('モックコメント編集開始:', { comment, newText: editingText.trim() });
      
      // 100msの遅延をシミュレート
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // コメントリストの該当コメントを更新
      setComments(prev => prev.map(c => 
        c === comment 
          ? { ...c, comment: editingText.trim() }
          : c
      ));
      
      setEditingCommentId(null);
      setEditingText('');
      
      console.log('モックコメント編集完了');
    } catch (error) {
      console.error('モックコメント編集エラー:', error);
    }
  };

  // コメント編集キャンセル
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  // モーダルが開かれたときにコメントを取得
  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, postId]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={handleBackdropClick}>
      <div className="bg-[#FEF4F4] w-full h-3/4 rounded-t-3xl p-4 flex flex-col shadow-2xl border border-gray-200" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#000000]/54">コメント</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#000000]/10 rounded-full transition-colors text-[#000000]/54"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コメント一覧 */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {comments.length === 0 ? (
            <p className="text-[#000000]/54 text-center py-8">まだコメントがありません</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm text-[#000000]/54">{comment.username}</span>
                    <span className="text-[#000000]/54 text-xs">
                      {new Date(comment.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="flex items-center space-x-2">
                                             <input
                         type="text"
                         value={editingText}
                         onChange={(e) => setEditingText(e.target.value)}
                         className="flex-1 border border-[#000000]/54 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#000000]/54 bg-white text-[#000000]/54"
                         placeholder="コメントを編集..."
                       />
                       <button
                         onClick={() => handleFinishEdit(comment)}
                         className="px-3 py-2 bg-[#000000]/54 text-white rounded-lg text-sm hover:bg-[#000000]/70 transition-colors"
                       >
                         保存
                       </button>
                       <button
                         onClick={handleCancelEdit}
                         className="px-3 py-2 bg-[#000000]/20 text-[#000000]/54 rounded-lg text-sm hover:bg-[#000000]/30 transition-colors"
                       >
                         キャンセル
                       </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-[#000000]/54 break-words">{comment.comment}</p>
                      {comment.user_id === currentUserId && (
                        <div className="flex items-center space-x-2 ml-2">
                                                     <button
                             onClick={() => handleStartEdit(comment)}
                             className="p-1 hover:bg-[#000000]/10 rounded transition-colors"
                           >
                             <Edit className="w-3 h-3 text-[#000000]/54" />
                           </button>
                           <button
                             onClick={() => handleDeleteComment(comment)}
                             className="p-1 hover:bg-[#000000]/10 rounded transition-colors"
                           >
                             <Trash2 className="w-3 h-3 text-[#000000]/54" />
                           </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* コメント入力フォーム */}
        <form onSubmit={handleSubmitComment} className="flex items-center space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを入力..."
            className="flex-1 border border-[#000000]/54 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#000000]/54 bg-white text-[#000000]/54 placeholder-[#000000]/54"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="p-2 bg-[#000000]/54 text-white rounded-full hover:bg-[#000000]/70 disabled:bg-[#000000]/20 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
