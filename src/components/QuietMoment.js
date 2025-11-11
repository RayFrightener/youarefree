"use client";

import { motion } from "motion/react";
import { IoClose } from "react-icons/io5";
import { track } from "../lib/analytics";

export default function QuietMoment({
  onContinue,
  onBookmark,
  currentPostId,
  // currentPostContent, // Reserved for future use
}) {
  const handleContinue = () => {
    track("quiet_moment_engaged", {
      metadata: { action: "continue" },
    });
    onContinue();
  };

  const handleBookmark = () => {
    track("quiet_moment_bookmarked", {
      postId: currentPostId,
      metadata: { action: "bookmark" },
    });
    onBookmark();
    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      onClick={handleContinue}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[#ECE9E9] rounded-2xl p-6 max-w-md w-full border border-[#BEBABA]/50 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-2">
          <button
            onClick={handleContinue}
            className="text-[#8C8888] hover:text-[#4E4A4A] transition-colors"
            aria-label="Close"
          >
            <IoClose size={20} />
          </button>
        </div>
        <h3 className="text-lg font-medium text-[#4E4A4A] mb-3 text-center">
          Take a moment to reflect
        </h3>
        <p className="text-sm text-[#8C8888] mb-6 text-center">
          You&apos;ve been reading for a while. Consider pausing to reflect on
          what you&apos;ve encountered, or save this expression for later.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleBookmark}
            className="px-5 py-2.5 rounded-full border-2 border-[#BEBABA]/50 bg-transparent text-[#8C8888] text-sm uppercase tracking-wider hover:border-[#BEBABA] hover:bg-[#BEBABA]/10 transition-all duration-300 cursor-pointer font-medium"
          >
            Save for Later
          </button>
          <button
            onClick={handleContinue}
            className="px-5 py-2.5 rounded-full bg-[#BEBABA] text-[#4E4A4A] text-sm uppercase tracking-wider hover:bg-[#BEBABA]/90 transition-all duration-300 cursor-pointer font-medium"
          >
            Continue Reading
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

