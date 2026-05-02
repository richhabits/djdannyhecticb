/**
 * Comment Section Component - Threaded Comments for Clips
 */

import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { useAtom } from "jotai";
import { userAtom } from "../stores/user";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { Heart, Trash2, Reply, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommentSectionProps {
  clipId: number;
  commentCount?: number;
}

export function CommentSection({ clipId, commentCount = 0 }: CommentSectionProps) {
  const [user] = useAtom(userAtom);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");

  // Queries
  const { data: comments, isLoading, refetch } = trpc.comments.getComments.useQuery(
    { clipId, limit: 20, sortBy },
    { enabled: !!clipId }
  );

  const { data: commentLikedStatus } = trpc.comments.isCommentLiked.useQuery(
    { commentId: 0 }, // Will be overridden per comment
    { enabled: false }
  );

  // Mutations
  const createCommentMutation = trpc.comments.createComment.useMutation({
    onSuccess: () => {
      setNewComment("");
      setReplyingTo(null);
      refetch();
      toast.success("Comment posted!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteCommentMutation = trpc.comments.deleteComment.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Comment deleted");
    },
  });

  const likeCommentMutation = trpc.comments.likeComment.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const unlikeCommentMutation = trpc.comments.unlikeComment.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handlePostComment = () => {
    if (!newComment.trim() || !user?.id) {
      toast.error("Please log in to comment");
      return;
    }

    createCommentMutation.mutate({
      clipId,
      content: newComment,
      parentCommentId: replyingTo || undefined,
    });
  };

  const toggleReplies = (commentId: number) => {
    const newSet = new Set(expandedReplies);
    if (newSet.has(commentId)) {
      newSet.delete(commentId);
    } else {
      newSet.add(commentId);
    }
    setExpandedReplies(newSet);
  };

  const CommentItem = ({ comment, isReply }: { comment: any; isReply?: boolean }) => (
    <div className={`${isReply ? "ml-8" : ""} space-y-3`}>
      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white text-sm">User {comment.userId}</p>
              <span className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-slate-200 text-sm mt-2">{comment.content}</p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 gap-1 text-xs"
                onClick={() => likeCommentMutation.mutate({ commentId: comment.id })}
              >
                <Heart size={14} />
                {comment.likeCount}
              </Button>
              {!isReply && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 gap-1 text-xs"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <Reply size={14} />
                  Reply
                </Button>
              )}
              {comment.userId === user?.id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 gap-1 text-xs text-red-400"
                  onClick={() => deleteCommentMutation.mutate({ commentId: comment.id })}
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Nested Reply Form */}
      {replyingTo === comment.id && (
        <Card className="p-4 bg-slate-700 border-slate-600 ml-8">
          <Textarea
            placeholder="Reply to this comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 text-sm"
            rows={2}
          />
          <div className="flex gap-2 justify-end mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setReplyingTo(null);
                setNewComment("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handlePostComment}
              disabled={createCommentMutation.isPending}
            >
              Reply
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Comment Count & Sort */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Comments ({commentCount || comments?.length || 0})
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={sortBy === "newest" ? "default" : "outline"}
            onClick={() => setSortBy("newest")}
          >
            Newest
          </Button>
          <Button
            size="sm"
            variant={sortBy === "popular" ? "default" : "outline"}
            onClick={() => setSortBy("popular")}
          >
            Popular
          </Button>
        </div>
      </div>

      {/* Post Comment Form */}
      {user?.id ? (
        <Card className="p-4 bg-slate-800 border-slate-700">
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-400"
            rows={3}
            maxLength={1000}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400">{newComment.length}/1000</span>
            <Button
              onClick={handlePostComment}
              disabled={!newComment.trim() || createCommentMutation.isPending}
            >
              {createCommentMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-slate-800 border-slate-700 text-center text-slate-400">
          <p>Sign in to comment</p>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id}>
              <CommentItem comment={comment} />
            </div>
          ))
        ) : (
          <Card className="p-6 bg-slate-800 border-slate-700 text-center text-slate-400">
            <p>No comments yet. Be the first to comment!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
