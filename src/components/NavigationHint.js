"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { IoMdArrowRoundUp, IoMdArrowRoundDown } from "react-icons/io";
import { IoClose } from "react-icons/io5";

const STORAGE_KEY = "navigation_hint_seen";

export default function NavigationHint({ onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if user has seen the hint before
    const hasSeenHint = localStorage.getItem(STORAGE_KEY) === "true";

    // Detect if mobile device
    const checkMobile = () => {
      return (
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      );
    };

    setIsMobile(checkMobile());

    // Show hint if user hasn't seen it and we have posts
    if (!hasSeenHint) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const handleGotIt = () => {
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#F5F5F5] rounded-lg p-6 max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-[#8C8888] hover:text-[#9C9191] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <IoClose size={24} />
          </button>

          {/* Content */}
          <div className="pr-8">
            <h3 className="text-xl font-semibold text-[#9C9191] mb-4">
              How to Navigate
            </h3>

            {isMobile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#8C8888]">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                      className="mb-2"
                    >
                      <IoMdArrowRoundUp size={32} className="text-[#9C9191]" />
                    </motion.div>
                    <span className="text-sm">Swipe Up</span>
                  </div>
                  <span className="flex-1 text-center">Next post</span>
                </div>

                <div className="flex items-center gap-3 text-[#8C8888]">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut",
                        delay: 0.3,
                      }}
                      className="mb-2"
                    >
                      <IoMdArrowRoundDown
                        size={32}
                        className="text-[#9C9191]"
                      />
                    </motion.div>
                    <span className="text-sm">Swipe Down</span>
                  </div>
                  <span className="flex-1 text-center">Previous post</span>
                </div>

                <p className="text-sm text-[#8C8888] pt-2 border-t border-[#DCD9D9]">
                  Swipe up or down on any post to navigate through the feed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#8C8888]">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                      className="mb-2"
                    >
                      <IoMdArrowRoundUp size={32} className="text-[#9C9191]" />
                    </motion.div>
                    <span className="text-sm">↑ Key</span>
                  </div>
                  <span className="flex-1 text-center">Previous post</span>
                </div>

                <div className="flex items-center gap-3 text-[#8C8888]">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut",
                        delay: 0.3,
                      }}
                      className="mb-2"
                    >
                      <IoMdArrowRoundDown
                        size={32}
                        className="text-[#9C9191]"
                      />
                    </motion.div>
                    <span className="text-sm">↓ Key</span>
                  </div>
                  <span className="flex-1 text-center">Next post</span>
                </div>

                <p className="text-sm text-[#8C8888] pt-2 border-t border-[#DCD9D9]">
                  Use the arrow keys on your keyboard or click and drag up/down
                  with your mouse to navigate.
                </p>
              </div>
            )}

            <button
              onClick={handleGotIt}
              className="mt-6 w-full px-4 py-2 rounded-lg bg-[#9C9191] text-[#F5F5F5] font-semibold hover:bg-[#8C8888] transition-colors cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
