"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

export default function CommunityIndicators() {
  const [reflectionsCount, setReflectionsCount] = useState(null);
  const [resonatingPost, setResonatingPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      const res = await fetch("/api/community");
      if (res.ok) {
        const data = await res.json();
        setReflectionsCount(data.reflectionsCount);
        setResonatingPost(data.resonatingPost);
      }
    } catch (error) {
      console.error("Error fetching community data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRangeText = (count) => {
    if (count === 0) return "No one";
    if (count <= 5) return "Few people";
    if (count <= 20) return "Some people";
    if (count <= 50) return "Many people";
    return "A community";
  };

  if (loading) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      {/* Reflections Counter */}
      {reflectionsCount !== null && reflectionsCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm text-[#8C8888]">
            {getRangeText(reflectionsCount)} reflected today
          </p>
        </motion.div>
      )}

      {/* Today's Resonating Post */}
      {resonatingPost && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center max-w-md"
        >
          <p className="text-xs text-[#BEBABA] mb-2 uppercase tracking-wider">
            Today&apos;s Resonating Expression
          </p>
          <p className="text-sm text-[#4E4A4A] italic leading-relaxed line-clamp-3">
            &quot;{resonatingPost.content}&quot;
          </p>
        </motion.div>
      )}

      {/* Gentle Nudge */}
      {reflectionsCount === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-sm text-[#8C8888] italic">
            Take a moment to reflect today
          </p>
        </motion.div>
      )}
    </div>
  );
}

