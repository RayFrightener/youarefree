import { prisma } from "@/lib/prisma";

/**
 * Get today's reflection count (people who posted or commented today)
 */
export async function getTodayReflectionsCount(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count unique users who posted or commented today
  const todayPosts = await prisma.post.findMany({
    where: {
      createdAt: { gte: today },
      isDeleted: false,
    },
    select: { userId: true },
    distinct: ["userId"],
  });

  const todayComments = await prisma.comment.findMany({
    where: {
      createdAt: { gte: today },
      isDeleted: false,
    },
    select: { userId: true },
    distinct: ["userId"],
    take: 1000, // Limit for performance
  });

  const uniqueUsers = new Set([
    ...todayPosts.map((p) => p.userId),
    ...todayComments.map((c) => c.userId),
  ]);

  return uniqueUsers.size;
}

/**
 * Get today's resonating post (post with most engagement today)
 */
export async function getTodaysResonatingPost(): Promise<{
  id: number;
  content: string;
  score: number;
} | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get posts from today with positive scores, ordered by score
  const posts = await prisma.post.findMany({
    where: {
      createdAt: { gte: today },
      isDeleted: false,
      score: { gt: 0 },
    },
    select: {
      id: true,
      content: true,
      score: true,
    },
    orderBy: {
      score: "desc",
    },
    take: 1,
  });

  if (posts.length === 0) {
    return null;
  }

  return posts[0];
}

