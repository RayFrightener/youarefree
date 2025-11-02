"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { IoMdArrowRoundUp, IoMdArrowRoundDown } from "react-icons/io";

export default function HowToNavigate({ onBack }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      return (
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      );
    };
    setIsMobile(checkMobile());

    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Back arrow at the top left */}
      <div className="flex items-start w-full">
        <button
          className="mb-4 mt-4 ml-2 cursor-pointer"
          onClick={onBack}
          aria-label="Back"
        >
          <IoMdArrowBack size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center w-full flex-1 px-4">
        <h2 className="text-2xl font-semibold text-[#9C9191] mb-8">
          How to Navigate
        </h2>

        {isMobile ? (
          <div className="w-full max-w-md space-y-6">
            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                >
                  <IoMdArrowRoundUp size={40} className="text-[#9C9191]" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#9C9191] mb-1">
                    Swipe Up
                  </h3>
                  <p className="text-sm text-[#8C8888]">
                    Navigate to the next post
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                    delay: 0.3,
                  }}
                >
                  <IoMdArrowRoundDown size={40} className="text-[#9C9191]" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#9C9191] mb-1">
                    Swipe Down
                  </h3>
                  <p className="text-sm text-[#8C8888]">
                    Navigate to the previous post
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#8C8888]">
                Simply swipe up or down on any post to browse through the feed.
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-6">
            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                >
                  <IoMdArrowRoundUp size={40} className="text-[#9C9191]" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#9C9191] mb-1">
                    Up Arrow Key (↑)
                  </h3>
                  <p className="text-sm text-[#8C8888]">
                    Navigate to the previous post
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  animate={{ y: [0, 15, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                    delay: 0.3,
                  }}
                >
                  <IoMdArrowRoundDown size={40} className="text-[#9C9191]" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#9C9191] mb-1">
                    Down Arrow Key (↓)
                  </h3>
                  <p className="text-sm text-[#8C8888]">
                    Navigate to the next post
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F5F5] rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🖱️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#9C9191] mb-1">
                    Mouse Click and Drag
                  </h3>
                  <p className="text-sm text-[#8C8888]">
                    Click and drag mouse up or down to navigate
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#8C8888]">
                Use arrow keys or your mouse to browse through posts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
