import { IoMdArrowBack } from "react-icons/io";
import { IoTrashBinOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "motion/react";
import { getEngagementRange, getRangeEmoji } from "@/lib/engagementRanges";

export default function UserProfile({
  profile,
  onBack,
  isOwnProfile = false,
  onDeletePost,
}) {
  if (!profile) return <div>Loading...</div>;
  const posts = Array.isArray(profile.posts) ? profile.posts : [];

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between mb-6 mt-0 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="cursor-pointer text-[#8C8888] hover:text-[#4E4A4A] transition-colors"
            aria-label="Back to feed"
          >
            <IoMdArrowBack size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-[#4E4A4A]">
              {profile.username}
            </h1>
            {profile.karma >= 1 && (
              <span className="text-xs text-[#8C8888] mt-1 uppercase tracking-wider">
                {profile.karma} {profile.karma === 1 ? "uplift" : "uplifts"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Posts List - Scrollable within card */}
      <div
        className="flex-1 overflow-y-auto min-h-0"
        style={{ maxHeight: "calc(80vh - 120px)" }}
      >
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center py-8"
          >
            <div className="text-lg font-light text-[#8C8888] leading-relaxed tracking-wide max-w-md">
              This space is quiet for now — expressions will show up once
              they&apos;ve received some upliftment.
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6 pr-2">
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="relative"
                >
                  <div className="flex flex-col gap-3 pb-6 border-b border-[#BEBABA]/30 last:border-0">
                    {/* Post Content */}
                    <div className="text-lg sm:text-xl font-light leading-relaxed tracking-wide text-[#4E4A4A]">
                      {post.content}
                    </div>

                    {/* Post Meta */}
                    <div className="flex items-center justify-between text-sm text-[#8C8888]">
                      <div className="flex items-center gap-4">
                        <span className="text-xs uppercase tracking-wider">
                          {new Date(post.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="text-[#BEBABA]">•</span>
                        {post.score > 0 && (
                          <span className="text-xs text-[#8C8888] italic">
                            {getRangeEmoji(post.score)} {getEngagementRange(post.score)}
                          </span>
                        )}
                        {post.score <= 0 && (
                          <span className="text-xs text-[#BEBABA] italic">
                            No engagement yet
                          </span>
                        )}
                      </div>

                      {/* Delete Button */}
                      {isOwnProfile && (
                        <button
                          className="p-2 rounded-full text-[#8C8888] hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 cursor-pointer"
                          onClick={() => onDeletePost && onDeletePost(post.id)}
                          aria-label="Delete post"
                        >
                          <IoTrashBinOutline size={18} />
                        </button>
                      )}
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
