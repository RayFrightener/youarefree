import { prisma } from "@/lib/prisma";

export interface ActivityItem {
  id: string;
  type: "vote" | "comment";
  postId: number;
  postContent: string;
  userId: string;
  username: string | null;
  createdAt: Date;
  commentContent?: string; // For comment type activities
}

/**
 * Get activity for a user - shows who interacted with their posts
 * Returns votes and comments on user's posts
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

  // Get all votes and comments on user's posts (excluding the user's own interactions)
  const [votes, comments] = await Promise.all([
    prisma.vote.findMany({
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
    }),
    prisma.comment.findMany({
      where: {
        postId: { in: postIds },
        userId: { not: userId }, // Exclude user's own comments
        isDeleted: false,
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
    }),
  ]);

  // Transform votes into activity items
  const voteActivities: ActivityItem[] = votes.map(
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

  // Transform comments into activity items
  const commentActivities: ActivityItem[] = comments.map(
    (comment: {
      id: number;
      postId: number;
      content: string;
      createdAt: Date;
      user: { id: string; username: string | null };
    }) => ({
      id: `comment-${comment.id}`,
      type: "comment" as const,
      postId: comment.postId,
      postContent: postMap.get(comment.postId) || "",
      userId: comment.user.id,
      username: comment.user.username,
      createdAt: comment.createdAt,
      commentContent: comment.content,
    })
  );

  // Combine and sort by most recent
  const allActivities = [...voteActivities, ...commentActivities];
  return allActivities.sort(
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

  // Count both votes and comments
  const [totalVotes, totalComments] = await Promise.all([
    prisma.vote.count({
      where: {
        postId: { in: postIds },
        userId: { not: userId },
      },
    }),
    prisma.comment.count({
      where: {
        postId: { in: postIds },
        userId: { not: userId },
        isDeleted: false,
      },
    }),
  ]);

  const totalInteractions = totalVotes + totalComments;

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [recentVotes, recentComments] = await Promise.all([
    prisma.vote.count({
      where: {
        postId: { in: postIds },
        userId: { not: userId },
        createdAt: { gte: oneDayAgo },
      },
    }),
    prisma.comment.count({
      where: {
        postId: { in: postIds },
        userId: { not: userId },
        isDeleted: false,
        createdAt: { gte: oneDayAgo },
      },
    }),
  ]);

  const recentInteractions = recentVotes + recentComments;

  return { totalInteractions, recentInteractions };
}
