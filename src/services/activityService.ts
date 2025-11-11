import { prisma } from "@/lib/prisma";

export interface ActivityItem {
  id: string;
  type: "vote" | "comment"; // Will add "comment" when comments are implemented
  postId: number;
  postContent: string;
  userId: string;
  username: string | null;
  createdAt: Date;
}

/**
 * Get activity for a user - shows who interacted with their posts
 * Returns votes on user's posts (comments will be added later)
 */
export async function getUserActivity(userId: string): Promise<ActivityItem[]> {
  // Get all posts by this user
  const userPosts = await prisma.post.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    select: {
      id: true,
      content: true,
    },
  });

  const postIds = userPosts.map(
    (post: { id: number; content: string }) => post.id
  );
  const postMap = new Map(
    userPosts.map((post: { id: number; content: string }) => [
      post.id,
      post.content,
    ])
  );

  if (postIds.length === 0) {
    return [];
  }

  // Get all votes on user's posts (excluding the user's own votes)
  const votes = await prisma.vote.findMany({
    where: {
      postId: { in: postIds },
      userId: { not: userId }, // Exclude user's own votes
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50, // Limit to recent 50 interactions
  });

  // Transform votes into activity items
  const activityItems: ActivityItem[] = votes.map(
    (vote: {
      id: number;
      postId: number;
      createdAt: Date;
      user: { id: string; username: string | null };
    }) => ({
      id: `vote-${vote.id}`,
      type: "vote" as const,
      postId: vote.postId,
      postContent: postMap.get(vote.postId) || "",
      userId: vote.user.id,
      username: vote.user.username,
      createdAt: vote.createdAt,
    })
  );

  // Sort by most recent
  return activityItems.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * Get activity summary - count of interactions without exact numbers
 */
export async function getActivitySummary(userId: string): Promise<{
  totalInteractions: number;
  recentInteractions: number; // Last 24 hours
}> {
  const userPosts = await prisma.post.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    select: {
      id: true,
    },
  });

  const postIds = userPosts.map((post: { id: number }) => post.id);

  if (postIds.length === 0) {
    return { totalInteractions: 0, recentInteractions: 0 };
  }

  const totalInteractions = await prisma.vote.count({
    where: {
      postId: { in: postIds },
      userId: { not: userId },
    },
  });

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentInteractions = await prisma.vote.count({
    where: {
      postId: { in: postIds },
      userId: { not: userId },
      createdAt: { gte: oneDayAgo },
    },
  });

  return { totalInteractions, recentInteractions };
}
