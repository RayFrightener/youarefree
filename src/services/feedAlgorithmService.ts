import { prisma } from "@/lib/prisma";

/**
 * Smart Feed Algorithm
 * 
 * Uses multiple signals to create a personalized, engaging feed:
 * 1. Engagement Quality Score (votes, comments, bookmarks, views)
 * 2. Time Decay (recent engagement matters more)
 * 3. User Personalization (what has this user engaged with?)
 * 4. Freshness Balance (new posts get visibility)
 * 5. Diversity (prevent echo chambers)
 * 6. Anti-Spam (sustained engagement over time)
 */

interface PostEngagementData {
  postId: number;
  score: number;
  commentCount: number;
  bookmarkCount: number;
  viewCount: number;
  createdAt: Date;
  recentEngagement: number; // Engagement in last 24 hours
  sustainedEngagement: boolean; // Has engagement over multiple days
  userQuality: number; // Quality score of post author
}

interface UserEngagementProfile {
  userId: string;
  viewedPostIds: Set<number>;
  engagedPostIds: Set<number>; // Posts they voted/commented on
  bookmarkedPostIds: Set<number>;
  preferredPostLength: number; // Average length of posts they engage with
  engagementRate: number; // How often they engage vs just view
}

/**
 * Calculate engagement quality score for a post
 * Combines multiple signals weighted by importance
 */
function calculateEngagementScore(
  post: PostEngagementData,
  now: Date
): number {
  const postAgeHours = (now.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60);
  
  // Base engagement signals (weighted)
  const voteScore = post.score * 1.0; // Direct votes
  const commentScore = post.commentCount * 2.5; // Comments = deeper engagement
  const bookmarkScore = post.bookmarkCount * 3.0; // Bookmarks = high value
  const viewScore = Math.log(post.viewCount + 1) * 0.5; // Logarithmic to prevent view spam
  
  const totalEngagement = voteScore + commentScore + bookmarkScore + viewScore;
  
  // Time decay: recent engagement weighted higher
  // Exponential decay: e^(-age/24) means 24h old = 37% weight, 48h = 14%
  const timeDecay = Math.exp(-postAgeHours / 24);
  
  // Freshness boost: new posts get visibility
  // Posts < 2 hours old get boost, then decays
  const freshnessBoost = postAgeHours < 2 ? 1.5 : Math.max(1.0, 1.0 - (postAgeHours - 2) / 48);
  
  // Recent engagement boost (last 24h)
  const recentBoost = post.recentEngagement > 0 ? 1.3 : 1.0;
  
  // Sustained engagement bonus (posts that stay relevant)
  const sustainedBonus = post.sustainedEngagement ? 1.2 : 1.0;
  
  // User quality factor (posts from good users rank higher)
  const qualityFactor = 0.8 + (post.userQuality * 0.2); // 0.8-1.0 range
  
  // Final score
  const engagementScore = 
    totalEngagement * 
    timeDecay * 
    freshnessBoost * 
    recentBoost * 
    sustainedBonus * 
    qualityFactor;
  
  return engagementScore;
}

/**
 * Get user's engagement profile from analytics
 */
async function getUserEngagementProfile(
  userId: string | undefined
): Promise<UserEngagementProfile | null> {
  if (!userId) return null;

  try {
    // Get posts user has viewed
    const viewedEvents = await prisma.analyticsEvent.findMany({
      where: {
        userId,
        eventType: { in: ["resonance_post_viewed", "page_view"] },
        postId: { not: null },
      },
      select: { postId: true },
      distinct: ["postId"],
    });

    // Get posts user has engaged with (voted, commented)
    const engagedEvents = await prisma.analyticsEvent.findMany({
      where: {
        userId,
        eventType: { in: ["vote_cast", "post_created"] }, // Comments tracked via post_created on comment posts
        postId: { not: null },
      },
      select: { postId: true },
      distinct: ["postId"],
    });

    // Get bookmarked posts
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      select: { postId: true },
    });

    // Calculate engagement rate
    const totalViews = viewedEvents.length;
    const totalEngagements = engagedEvents.length;
    const engagementRate = totalViews > 0 ? totalEngagements / totalViews : 0;

    // Get average post length user engages with (from posts they commented on)
    const commentedPosts = await prisma.comment.findMany({
      where: { userId },
      select: {
        post: {
          select: { content: true },
        },
      },
    });
    
    const avgLength = commentedPosts.length > 0
      ? commentedPosts.reduce((sum: number, c: { post: { content: string } }) => sum + (c.post.content.length || 0), 0) / commentedPosts.length
      : 0;

    return {
      userId,
      viewedPostIds: new Set(
        viewedEvents
          .map((e: { postId: number | null }) => e.postId)
          .filter((id: number | null): id is number => id !== null)
      ),
      engagedPostIds: new Set(
        engagedEvents
          .map((e: { postId: number | null }) => e.postId)
          .filter((id: number | null): id is number => id !== null)
      ),
      bookmarkedPostIds: new Set(bookmarks.map((b: { postId: number }) => b.postId)),
      preferredPostLength: avgLength,
      engagementRate,
    };
  } catch (error) {
    console.error("Error getting user engagement profile:", error);
    return null;
  }
}

/**
 * Calculate personalization score for a post
 * Based on user's past behavior
 */
function calculatePersonalizationScore(
  post: {
    id: number;
    content: string;
    userId: string;
  },
  userProfile: UserEngagementProfile | null
): number {
  if (!userProfile) return 1.0; // No personalization for anonymous users

  let score = 1.0;

  // Penalty: Don't show posts user has already viewed
  if (userProfile.viewedPostIds.has(post.id)) {
    score *= 0.1; // Heavily penalize already-viewed posts
  }

  // Boost: Show posts similar to what user engages with
  if (userProfile.engagedPostIds.has(post.id)) {
    score *= 0.3; // Slightly penalize (they've already engaged)
  }

  // Boost: Posts from users whose content they've engaged with
  // (This would require tracking which users they engage with - simplified for now)
  
  // Boost: Posts similar length to what they engage with
  if (userProfile.preferredPostLength > 0) {
    const lengthDiff = Math.abs(post.content.length - userProfile.preferredPostLength);
    const lengthSimilarity = 1.0 - Math.min(lengthDiff / userProfile.preferredPostLength, 1.0);
    score *= (0.9 + lengthSimilarity * 0.2); // 0.9-1.1 range
  }

  // Boost: If user has high engagement rate, show more engaging content
  if (userProfile.engagementRate > 0.3) {
    score *= 1.1; // Slight boost for engaged users
  }

  return score;
}

/**
 * Get user quality score (based on their posts' performance)
 */
async function getUserQualityScore(userId: string): Promise<number> {
  try {
    const userPosts = await prisma.post.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      select: {
        score: true,
        _count: {
          select: {
            comments: { where: { isDeleted: false } },
            bookmarks: true,
          },
        },
      },
    });

    if (userPosts.length === 0) return 0.5; // Default for new users

    // Calculate average engagement per post
    const avgScore = userPosts.reduce((sum: number, p: { score: number }) => sum + p.score, 0) / userPosts.length;
    const avgComments = userPosts.reduce((sum: number, p: { _count: { comments: number } }) => sum + p._count.comments, 0) / userPosts.length;
    const avgBookmarks = userPosts.reduce((sum: number, p: { _count: { bookmarks: number } }) => sum + p._count.bookmarks, 0) / userPosts.length;

    // Normalize to 0-1 range
    const qualityScore = Math.min(
      1.0,
      (avgScore / 10) * 0.4 + // Votes (max 10 = 0.4)
      (avgComments / 5) * 0.4 + // Comments (max 5 = 0.4)
      (avgBookmarks / 3) * 0.2 // Bookmarks (max 3 = 0.2)
    );

    return qualityScore;
  } catch (error) {
    console.error("Error calculating user quality:", error);
    return 0.5;
  }
}

/**
 * Get post engagement data from database and analytics
 */
async function getPostEngagementData(
  post: {
    id: number;
    score: number;
    createdAt: Date;
    userId: string;
    _count?: { comments?: number; votes?: number; bookmarks?: number };
  }
): Promise<PostEngagementData> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Get recent engagement (last 24h)
  const recentEngagement = await prisma.analyticsEvent.count({
    where: {
      postId: post.id,
      eventType: { in: ["vote_cast", "resonance_post_viewed", "bookmark_toggled"] },
      createdAt: { gte: oneDayAgo },
    },
  });

  // Check for sustained engagement (activity over multiple days)
  const engagementTwoDaysAgo = await prisma.analyticsEvent.count({
    where: {
      postId: post.id,
      eventType: { in: ["vote_cast", "resonance_post_viewed"] },
      createdAt: {
        gte: twoDaysAgo,
        lt: oneDayAgo,
      },
    },
  });

  const sustainedEngagement = recentEngagement > 0 && engagementTwoDaysAgo > 0;

  // Get view count
  const viewCount = await prisma.analyticsEvent.count({
    where: {
      postId: post.id,
      eventType: "resonance_post_viewed",
    },
  });

  // Get user quality
  const userQuality = await getUserQualityScore(post.userId);

  return {
    postId: post.id,
    score: post.score,
    commentCount: post._count?.comments || 0,
    bookmarkCount: post._count?.bookmarks || 0,
    viewCount,
    createdAt: post.createdAt,
    recentEngagement,
    sustainedEngagement,
    userQuality,
  };
}

/**
 * Main smart feed algorithm
 * Returns posts sorted by intelligent ranking
 */
export async function getSmartFeedPosts(
  userId?: string,
  limit: number = 50
) {
  console.log("[Smart Feed Algorithm] Calculating personalized feed...");
  try {
    // Get all non-deleted posts with engagement data
    const posts = await prisma.post.findMany({
      where: { isDeleted: false },
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        },
        votes: userId
          ? {
              where: { userId },
              select: { voteType: true },
            }
          : false,
        _count: {
          select: {
            comments: { where: { isDeleted: false } },
            votes: true,
            bookmarks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" }, // Start with recent posts
      take: limit * 2, // Get more than needed for diversity
    });

    // Get user engagement profile
    const userProfile = await getUserEngagementProfile(userId);

    // Calculate scores for each post
    const now = new Date();
    const postsWithScores = await Promise.all(
      posts.map(async (post: {
        id: number;
        score: number;
        createdAt: Date;
        userId: string;
        content: string;
        _count?: { comments?: number; votes?: number; bookmarks?: number };
        [key: string]: unknown;
      }) => {
        const engagementData = await getPostEngagementData(post);
        const engagementScore = calculateEngagementScore(engagementData, now);
        const personalizationScore = calculatePersonalizationScore(
          {
            id: post.id,
            content: post.content,
            userId: post.userId,
          },
          userProfile
        );

        // Final score: engagement × personalization
        const finalScore = engagementScore * personalizationScore;

        return {
          ...post,
          finalScore,
          engagementScore,
          personalizationScore,
        };
      })
    );

    // Sort by final score
    postsWithScores.sort((a, b) => b.finalScore - a.finalScore);

    // Apply diversity: ensure we don't show too many posts from same user
    const diversifiedPosts: typeof postsWithScores = [];
    const userPostCounts = new Map<string, number>();
    const maxPostsPerUser = Math.ceil(limit / 10); // Max 10% from one user

    for (const post of postsWithScores) {
      const userCount = userPostCounts.get(post.userId) || 0;
      if (userCount < maxPostsPerUser || diversifiedPosts.length < limit * 0.5) {
        diversifiedPosts.push(post);
        userPostCounts.set(post.userId, userCount + 1);
      }
      if (diversifiedPosts.length >= limit) break;
    }

    // Return formatted posts (remove internal scoring data)
    return diversifiedPosts.map((post) => ({
      ...post,
      currentUserVote: post.votes?.[0]?.voteType ?? 0,
      votes: undefined,
      finalScore: undefined,
      engagementScore: undefined,
      personalizationScore: undefined,
    }));
  } catch (error) {
    console.error("Error in smart feed algorithm:", error);
    // Fallback to simple sorting
    return prisma.post.findMany({
      where: { isDeleted: false },
      orderBy: { score: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        },
        votes: userId
          ? {
              where: { userId },
              select: { voteType: true },
            }
          : false,
      },
    });
  }
}

