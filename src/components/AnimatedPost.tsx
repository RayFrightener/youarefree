"use client";

import { motion } from "motion/react";
import { useTextReveal } from "../hooks/useTextReveal";
import { useState, useEffect, useRef } from "react";
import { IoFlagOutline } from "react-icons/io5";

interface AnimatedPostProps {
  content: string;
  username?: string;
  postId?: number;
  onUsernameClick?: () => void;
  onFlagClick?: () => void;
  isFlagged?: boolean;
  showControls: boolean;
  onControlsReady?: () => void;
  renderButtons?: () => React.ReactNode;
  readingTime?: number;
  onPostView?: () => void;
}

export default function AnimatedPost({
  content,
  username,
  // postId, // Not used, removed from destructuring
  onUsernameClick,
  onFlagClick,
  isFlagged = false,
  showControls,
  onControlsReady,
  renderButtons,
  readingTime,
  onPostView,
}: AnimatedPostProps) {
  const [showUsername, setShowUsername] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const hasTrackedView = useRef(false);
  // Skip button implementation - commented out
  // const [showSkipButton, setShowSkipButton] = useState(false);
  // const skipButtonTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // const hasShownSkipRef = useRef(false);

  const { text, visibleChars } = useTextReveal({
    // const { text, visibleChars, isComplete, skip } = useTextReveal({
    text: content,
    charsPerSecond: 9.825, // 9.825 is the average speed of the human voice wow check this, i was just experimenting what felt best and this is what felt best and OMG, OMG!!!
    onComplete: () => {
      setTimeout(() => {
        setShowUsername(true);
        setTimeout(() => {
          setShowButtons(true);
          if (onControlsReady) {
            onControlsReady();
          }
        }, 400);
      }, 500);
    },
  });

  // Track post view when content is fully revealed (only once per post)
  useEffect(() => {
    if (showButtons && onPostView && !hasTrackedView.current) {
      onPostView();
      hasTrackedView.current = true;
    }
  }, [showButtons, onPostView]);

  // Reset everything when content changes
  useEffect(() => {
    setShowUsername(false);
    setShowButtons(false);
    hasTrackedView.current = false;
    // Skip button implementation - commented out
    // setShowSkipButton(false);
    // hasShownSkipRef.current = false;

    // Clear any pending timeout
    // if (skipButtonTimeoutRef.current) {
    //   clearTimeout(skipButtonTimeoutRef.current);
    //   skipButtonTimeoutRef.current = null;
    // }

    // Show skip button after a delay, only once per content
    // if (content && content.length > 0) {
    //   skipButtonTimeoutRef.current = setTimeout(() => {
    //     // Double check isComplete hasn't changed
    //     if (!isComplete && !hasShownSkipRef.current) {
    //       setShowSkipButton(true);
    //       hasShownSkipRef.current = true;
    //     }
    //   }, 800);
    // }

    // return () => {
    //   if (skipButtonTimeoutRef.current) {
    //     clearTimeout(skipButtonTimeoutRef.current);
    //     skipButtonTimeoutRef.current = null;
    //   }
    // };
  }, [content]); // Only depend on content, not isComplete

  // Hide skip button when animation completes
  // useEffect(() => {
  //   if (isComplete) {
  //     setShowSkipButton(false);
  //   }
  // }, [isComplete]);

  // const handleSkip = () => {
  //   setShowSkipButton(false);
  //   skip();
  //   // Immediately show username and buttons
  //   setTimeout(() => {
  //     setShowUsername(true);
  //     setShowButtons(true);
  //     if (onControlsReady) {
  //       onControlsReady();
  //     }
  //   }, 100);
  // };

  // Split text into visible and hidden parts
  const visibleText = text.slice(0, visibleChars);
  const hiddenText = text.slice(visibleChars);

  // Only show button if it should be visible and animation isn't complete
  // const shouldShowSkip = showSkipButton && !isComplete;

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Skip Button - Subtle, appears during animation */}
      {/* <AnimatePresence>
        {shouldShowSkip && (
          <motion.button
            key="skip-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleSkip}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 px-3 py-1.5 rounded-full bg-[#BEBABA]/20 backdrop-blur-sm border border-[#BEBABA]/30 text-[#8C8888] text-xs uppercase tracking-wider hover:bg-[#BEBABA]/30 hover:border-[#BEBABA]/50 transition-all duration-200 cursor-pointer font-medium"
            aria-label="Skip animation"
          >
            Skip
          </motion.button>
        )}
      </AnimatePresence> */}

      {/* Centered Content Area - Fixed height to prevent shifting */}
      <div className="flex-1 flex flex-col justify-center items-center min-h-0">
        <div className="w-full max-w-2xl text-center">
          {/* Animated Post Text */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light leading-relaxed tracking-wide px-4">
            <div className="text-center">
              {/* Visible text */}
              <span>{visibleText}</span>
              {/* Hidden text (reserves space but invisible) */}
              <span className="opacity-0">{hiddenText}</span>
            </div>
          </h2>

          {/* Username, Reading Time, and Flag - Always rendered to reserve space */}
          <div className="text-sm text-[#8C8888] flex items-center justify-center gap-3 mt-8 min-h-[28px] flex-wrap">
            {showUsername && username ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center gap-3"
              >
                <span>—</span>
                <button
                  className="underline cursor-pointer"
                  onClick={onUsernameClick}
                >
                  {username}
                </button>
                {readingTime && readingTime > 0 && (
                  <>
                    <span className="text-[#BEBABA]">•</span>
                    <span className="text-xs italic">
                      ~{readingTime} {readingTime === 1 ? "min" : "mins"} read
                    </span>
                  </>
                )}
                {onFlagClick && (
                  <button
                    className={`cursor-pointer transition-opacity ${
                      isFlagged
                        ? "text-red-400 opacity-80"
                        : "opacity-40 hover:opacity-80"
                    }`}
                    title="Flag this post"
                    onClick={onFlagClick}
                  >
                    <IoFlagOutline size={16} />
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="opacity-0" aria-hidden="true">
                <span>—</span>
                <span>username</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons - Always rendered to reserve space */}
      {showControls && renderButtons && (
        <div className="pt-12 pb-6 px-2 sm:px-4 w-full max-w-full overflow-hidden min-h-[140px] sm:min-h-[160px]">
          {showButtons ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-full overflow-hidden"
            >
              {renderButtons()}
            </motion.div>
          ) : (
            <div
              className="w-full max-w-full overflow-hidden opacity-0"
              aria-hidden="true"
            >
              {renderButtons()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
