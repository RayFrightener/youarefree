"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoMdArrowBack } from "react-icons/io";

export default function Activity({ onBack, onNavigateToPost }) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchActivity();
    fetchSummary();
  }, []);

  const fetchActivity = async () => {
    try {
      const res = await fetch("/api/activity");
      if (res.ok) {
        const data = await res.json();
        setActivity(data);
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/activity?summary=true");
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Error fetching activity summary:", error);
    }
  };

  const getInteractionText = (item) => {
    if (item.type === "vote") {
      return "found value in";
    }
    if (item.type === "comment") {
      return "reflected on";
    }
    return "engaged with";
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

  const getRangeText = (count) => {
    if (count === 0) return "No one";
    if (count <= 5) return "Few people";
    if (count <= 20) return "Some people";
    return "Many people";
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Back arrow at the top left */}
      <div className="flex items-start w-full mb-6">
        <button
          className="cursor-pointer text-[#8C8888] hover:text-[#4E4A4A] transition-colors"
          onClick={onBack}
          aria-label="Back to More"
        >
          <IoMdArrowBack size={24} />
        </button>
      </div>

      {/* Activity Summary */}
      {summary && (
        <div className="mb-6 text-center">
          <p className="text-sm text-[#8C8888] mb-2">
            {summary.recentInteractions > 0
              ? `${getRangeText(summary.recentInteractions)} engaged with your expressions today`
              : "No recent activity"}
          </p>
          {summary.totalInteractions > 0 && (
            <p className="text-xs text-[#BEBABA]">
              {getRangeText(summary.totalInteractions)} have found value in your
              expressions
            </p>
          )}
        </div>
      )}

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#8C8888] text-sm">Loading activity...</div>
          </div>
        ) : activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[#8C8888] text-sm mb-2">
              No activity yet
            </p>
            <p className="text-xs text-[#BEBABA] max-w-xs">
              When others engage with your expressions, you&apos;ll see it here
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {activity.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border-b border-[#BEBABA]/30 pb-4 last:border-0"
                >
                  <button
                    onClick={() => onNavigateToPost && onNavigateToPost(item.postId)}
                    className="w-full text-left flex flex-col gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <div className="text-sm text-[#4E4A4A]">
                      <span className="font-medium">
                        {item.username || "Someone"}
                      </span>{" "}
                      <span className="text-[#8C8888]">
                        {getInteractionText(item)} your expression
                      </span>
                    </div>
                    <div className="text-xs text-[#8C8888] italic line-clamp-2">
                      &quot;{item.postContent}&quot;
                    </div>
                    {item.type === "comment" && item.commentContent && (
                      <div className="text-xs text-[#BEBABA] italic line-clamp-2 pl-2 border-l-2 border-[#BEBABA]/20">
                        &quot;{item.commentContent}&quot;
                      </div>
                    )}
                    <div className="text-xs text-[#BEBABA]">
                      {formatTimeAgo(item.createdAt)}
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

