"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoMdArrowBack } from "react-icons/io";
import { IoChevronDown, IoChevronUp, IoTrashOutline } from "react-icons/io5";
import { useSession } from "next-auth/react";

export default function CommentSection({ postId, onBack }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);
  const [expandedThreads, setExpandedThreads] = useState(new Set());
  const [collapsedThreads, setCollapsedThreads] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // { commentId, commentContent }
  const commentsEndRef = useRef(null);
  const replyInputRefs = useRef({});

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // Fetch current user ID
  useEffect(() => {
    if (session) {
      fetch("/api/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.id) {
            setCurrentUserId(data.id);
          }
        })
        .catch((error) => {
          console.error("Error fetching user ID:", error);
        });
    }
  }, [session]);

  useEffect(() => {
    // Auto-expand all threads initially
    if (comments.length > 0 && expandedThreads.size === 0) {
      const allIds = new Set();
      const collectIds = (commentList) => {
        commentList.forEach((comment) => {
          allIds.add(comment.id);
          if (comment.replies && comment.replies.length > 0) {
            collectIds(comment.replies);
          }
        });
      };
      collectIds(comments);
      setExpandedThreads(allIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments.length]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!session || !newComment.trim() || newComment.trim().length < 10) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: newComment.trim(),
        }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewComment("");
        // Scroll to new comment
        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to post reflection");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post reflection");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId) => {
    if (!session || !replyContent.trim() || replyContent.trim().length < 10) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: replyContent.trim(),
          parentId,
        }),
      });

      if (res.ok) {
        const reply = await res.json();
        // Recursively update comments to add the new reply
        const updateComments = (commentList) => {
          return commentList.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), reply],
              };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateComments(comment.replies),
              };
            }
            return comment;
          });
        };
        setComments(updateComments);
        setReplyContent("");
        setReplyingTo(null);
        // Expand the thread to show the new reply
        setExpandedThreads((prev) => new Set([...prev, parentId]));
        setCollapsedThreads((prev) => {
          const next = new Set(prev);
          next.delete(parentId);
          return next;
        });
      } else {
        const error = await res.json();
        alert(error.error || "Failed to post reply");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleThread = (commentId) => {
    setCollapsedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const handleDeleteClick = (commentId, commentContent) => {
    if (!session) return;
    setConfirmDelete({ commentId, commentContent });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;

    const { commentId } = confirmDelete;
    setConfirmDelete(null);
    setDeleting((prev) => new Set([...prev, commentId]));

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Recursively remove the comment from the tree
        const removeComment = (commentList) => {
          return commentList
            .filter((comment) => comment.id !== commentId)
            .map((comment) => {
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: removeComment(comment.replies),
                };
              }
              return comment;
            });
        };
        setComments(removeComment);
      } else {
        const error = await res.json();
        // Could add a toast notification here instead of alert
        console.error(
          "Failed to delete:",
          error.error || "Failed to delete reflection"
        );
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const countReplies = (comment) => {
    let count = comment.replies?.length || 0;
    if (comment.replies) {
      comment.replies.forEach((reply) => {
        count += countReplies(reply);
      });
    }
    return count;
  };

  const renderComment = (comment, depth = 0) => {
    const replyCount = countReplies(comment);
    const hasReplies = replyCount > 0;
    const isCollapsed = collapsedThreads.has(comment.id);
    const isReplying = replyingTo === comment.id;
    const maxDepth = 8; // Visual limit, but still functional
    const indentWidth = Math.min(depth * 16, maxDepth * 16);

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
        className={`relative ${depth > 0 ? "mt-4" : ""}`}
        style={{ marginLeft: `${indentWidth}px` }}
      >
        <div
          className={`relative ${
            depth > 0
              ? "border-l-2 border-[#BEBABA]/20 pl-4 before:absolute before:left-[-2px] before:top-0 before:h-4 before:w-2 before:bg-[#ECE9E9]"
              : ""
          }`}
        >
          {/* Comment Content */}
          <div className="flex flex-col gap-2 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-[#4E4A4A]">
                {comment.user.username || "Someone"}
              </span>
              <span className="text-xs text-[#BEBABA]">•</span>
              <span className="text-xs text-[#8C8888]">
                {formatTimeAgo(comment.createdAt)}
              </span>
              {hasReplies && (
                <>
                  <span className="text-xs text-[#BEBABA]">•</span>
                  <button
                    onClick={() => toggleThread(comment.id)}
                    className="text-xs text-[#8C8888] hover:text-[#4E4A4A] transition-colors flex items-center gap-1"
                  >
                    {isCollapsed ? (
                      <>
                        <IoChevronDown size={12} />
                        {replyCount} {replyCount === 1 ? "reply" : "replies"}
                      </>
                    ) : (
                      <>
                        <IoChevronUp size={12} />
                        Hide {replyCount}{" "}
                        {replyCount === 1 ? "reply" : "replies"}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
            <p className="text-sm text-[#4E4A4A] leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
            <div className="flex items-center gap-3">
              {session && (
                <button
                  onClick={() => {
                    setReplyingTo(comment.id);
                    setTimeout(() => {
                      const input = replyInputRefs.current[comment.id];
                      if (input) {
                        input.focus();
                      }
                    }, 100);
                  }}
                  className="text-xs text-[#8C8888] hover:text-[#4E4A4A] transition-colors font-medium"
                >
                  Reply
                </button>
              )}
              {session && currentUserId === comment.userId && (
                <button
                  onClick={() => handleDeleteClick(comment.id, comment.content)}
                  disabled={deleting.has(comment.id)}
                  className="text-xs text-[#8C8888] hover:text-red-500 transition-colors font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete this reflection"
                >
                  <IoTrashOutline size={14} />
                  {deleting.has(comment.id) ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>

          {/* Reply Form */}
          {isReplying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 mb-4"
            >
              <textarea
                ref={(el) => (replyInputRefs.current[comment.id] = el)}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your reflection... (min 10 characters)"
                className="w-full p-3 rounded-lg border border-[#BEBABA]/50 bg-transparent text-sm text-[#4E4A4A] placeholder-[#BEBABA] focus:outline-none focus:border-[#BEBABA] resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setReplyingTo(null);
                    setReplyContent("");
                  }
                }}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={submitting || replyContent.trim().length < 10}
                  className="px-4 py-2 rounded-full bg-[#BEBABA] text-[#4E4A4A] text-xs uppercase tracking-wider hover:bg-[#BEBABA]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Posting..." : "Post"}
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                  className="px-4 py-2 rounded-full border border-[#BEBABA]/50 text-[#8C8888] text-xs uppercase tracking-wider hover:border-[#BEBABA] transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Replies */}
          {hasReplies && !isCollapsed && (
            <div className="mt-2 space-y-1">
              <AnimatePresence>
                {comment.replies.map((reply) =>
                  renderComment(reply, depth + 1, comment.id)
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Collapsed Replies Indicator */}
          {hasReplies && isCollapsed && (
            <div className="mt-2 pl-4 border-l-2 border-[#BEBABA]/20">
              <button
                onClick={() => toggleThread(comment.id)}
                className="text-xs text-[#8C8888] hover:text-[#4E4A4A] transition-colors flex items-center gap-1 py-2"
              >
                <IoChevronDown size={12} />
                Show {replyCount} {replyCount === 1 ? "reply" : "replies"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 pb-4 border-b border-[#BEBABA]/30">
        <button
          onClick={onBack}
          className="cursor-pointer text-[#8C8888] hover:text-[#4E4A4A] transition-colors"
          aria-label="Back to feed"
        >
          <IoMdArrowBack size={24} />
        </button>
        <h2 className="text-xl font-light text-[#4E4A4A]">
          Reflections {comments.length > 0 && `(${comments.length})`}
        </h2>
        <div className="w-6" /> {/* Spacer for centering */}
      </div>

      {/* Comments List - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 scroll-smooth">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#8C8888] text-sm">Loading reflections...</div>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[#8C8888] text-sm mb-2">No reflections yet</p>
            <p className="text-xs text-[#BEBABA] max-w-xs">
              Be the first to share your thoughts
            </p>
          </div>
        ) : (
          <div className="space-y-6 pr-2">
            <AnimatePresence>
              {comments.map((comment) => renderComment(comment, 0))}
            </AnimatePresence>
            <div ref={commentsEndRef} />
          </div>
        )}
      </div>

      {/* Comment Form - Fixed at bottom */}
      {session ? (
        <form
          onSubmit={handleSubmitComment}
          className="flex-shrink-0 mt-4 pt-4 border-t border-[#BEBABA]/30"
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your reflection... (min 10 characters)"
            className="w-full p-3 rounded-lg border border-[#BEBABA]/50 bg-transparent text-sm text-[#4E4A4A] placeholder-[#BEBABA] focus:outline-none focus:border-[#BEBABA] resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || newComment.trim().length < 10}
              className="px-6 py-2 rounded-full bg-[#BEBABA] text-[#4E4A4A] text-xs uppercase tracking-wider hover:bg-[#BEBABA]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Posting..." : "Post Reflection"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex-shrink-0 mt-4 pt-4 border-t border-[#BEBABA]/30 text-center text-sm text-[#8C8888]">
          Sign in to share your reflections
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#ECE9E9] rounded-2xl p-6 max-w-md w-full border border-[#BEBABA]/50 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-[#4E4A4A] mb-3">
                Delete Reflection?
              </h3>
              <p className="text-sm text-[#8C8888] mb-6">
                Are you sure you want to delete this reflection? This action
                cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-5 py-2.5 rounded-full border-2 border-[#BEBABA]/50 bg-transparent text-[#8C8888] text-sm uppercase tracking-wider hover:border-[#BEBABA] hover:bg-[#BEBABA]/10 transition-all duration-300 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2.5 rounded-full bg-red-500/90 text-white text-sm uppercase tracking-wider hover:bg-red-500 transition-all duration-300 cursor-pointer font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
