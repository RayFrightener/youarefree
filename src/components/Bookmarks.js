"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoMdArrowBack } from "react-icons/io";
import { getEngagementRange, getRangeEmoji } from "@/lib/engagementRanges";

export default function Bookmarks({ onBack }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch("/api/bookmarks");
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (postId) => {
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (res.ok) {
        // Remove from local state
        setBookmarks((prev) => prev.filter((b) => b.postId !== postId));
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <button
          onClick={onBack}
          className="cursor-pointer text-[#8C8888] hover:text-[#4E4A4A] transition-colors"
          aria-label="Back to More"
        >
          <IoMdArrowBack size={24} />
        </button>
        <h2 className="text-xl font-light text-[#4E4A4A]">Saved Reflections</h2>
        <div className="w-6" /> {/* Spacer for centering */}
      </div>

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#8C8888] text-sm">Loading bookmarks...</div>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[#8C8888] text-sm mb-2">No saved reflections</p>
            <p className="text-xs text-[#BEBABA] max-w-xs">
              Bookmark expressions that resonate with you for later reflection
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {bookmarks.map((bookmark) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border-b border-[#BEBABA]/30 pb-6 last:border-0"
                >
                  <div className="flex flex-col gap-3">
                    {/* Post Content */}
                    <div className="text-lg sm:text-xl font-light leading-relaxed tracking-wide text-[#4E4A4A]">
                      {bookmark.post.content}
                    </div>

                    {/* Post Meta */}
                    <div className="flex items-center justify-between text-sm text-[#8C8888]">
                      <div className="flex items-center gap-4">
                        <span className="text-xs uppercase tracking-wider">
                          {new Date(bookmark.post.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="text-[#BEBABA]">•</span>
                        <span className="text-xs text-[#8C8888]">
                          {bookmark.post.user.username || "Someone"}
                        </span>
                        {bookmark.post.score > 0 && (
                          <>
                            <span className="text-[#BEBABA]">•</span>
                            <span className="text-xs text-[#8C8888] italic">
                              {getRangeEmoji(bookmark.post.score)}{" "}
                              {getEngagementRange(bookmark.post.score)}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Remove Bookmark Button */}
                      <button
                        onClick={() => handleRemoveBookmark(bookmark.postId)}
                        className="text-xs text-[#8C8888] hover:text-[#4E4A4A] transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

