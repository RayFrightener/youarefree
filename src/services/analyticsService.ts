import { prisma } from "@/lib/prisma";

export type EventType =
  | "page_view"
  | "post_created"
  | "vote_cast"
  | "post_deleted"
  | "flag_created"
  | "feedback_submitted"
  | "session_start"
  | "session_end"
  | "profile_view"
  | "username_setup_completed"
  | "code_of_honor_accepted"
  | "sign_in"
  | "sign_out"
  | "feed_sort_changed"
  | "navigation_hint_dismissed";

export interface AnalyticsMetadata {
  [key: string]: unknown;
}

/**
 * Track an analytics event
 */
export async function trackEvent(
  eventType: EventType,
  options?: {
    userId?: string;
    postId?: number;
    metadata?: AnalyticsMetadata;
  }
) {
  try {
    const event = await prisma.analyticsEvent.create({
      data: {
        eventType,
        userId: options?.userId || null,
        postId: options?.postId || null,
        metadata: options?.metadata || null,
      },
    });

    // Update user's lastActiveAt if userId provided
    if (options?.userId) {
      await prisma.user.update({
        where: { id: options.userId },
        data: { lastActiveAt: new Date() },
      });
    }

    return event;
  } catch (error) {
    console.error("Error tracking event:", error);
    // Don't throw - analytics shouldn't break the app
    return null;
  }
}

/**
 * Get analytics metrics
 */
export async function getAnalyticsMetrics(options?: {
  startDate?: Date;
  endDate?: Date;
}) {
  const startDate =
    options?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
  const endDate = options?.endDate || new Date();

  try {
    // Total events
    const totalEvents = await prisma.analyticsEvent.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Events by type
    const eventsByType = await prisma.analyticsEvent.groupBy({
      by: ["eventType"],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    // Unique users
    const uniqueUsers = await prisma.analyticsEvent.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        userId: { not: null },
      },
      distinct: ["userId"],
      select: { userId: true },
    });

    // Daily active users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyActiveUsers = await prisma.analyticsEvent.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        userId: { not: null },
      },
      distinct: ["userId"],
      select: { userId: true },
    });

    // Posts created
    const postsCreated = await prisma.analyticsEvent.count({
      where: {
        eventType: "post_created",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Votes cast
    const votesCast = await prisma.analyticsEvent.count({
      where: {
        eventType: "vote_cast",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // User signups
    const signups = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Return rate (users who returned within 7 days)
    const allUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: { id: true, createdAt: true },
    });

    let returnCount = 0;
    for (const user of allUsers) {
      const firstEvent = await prisma.analyticsEvent.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });
      if (firstEvent) {
        const daysSinceFirstEvent =
          (Date.now() - firstEvent.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceFirstEvent <= 7) {
          const hasReturned = await prisma.analyticsEvent.findFirst({
            where: {
              userId: user.id,
              createdAt: {
                gt: new Date(
                  firstEvent.createdAt.getTime() + 24 * 60 * 60 * 1000
                ), // At least 1 day later
              },
            },
          });
          if (hasReturned) returnCount++;
        }
      }
    }

    return {
      totalEvents,
      eventsByType: eventsByType.map(
        (e: { eventType: string; _count: number }) => ({
          eventType: e.eventType,
          count: e._count,
        })
      ),
      uniqueUsers: uniqueUsers.length,
      dailyActiveUsers: dailyActiveUsers.length,
      postsCreated,
      votesCast,
      signups,
      returnRate:
        allUsers.length > 0 ? (returnCount / allUsers.length) * 100 : 0,
      period: {
        startDate,
        endDate,
      },
    };
  } catch (error) {
    console.error("Error getting analytics:", error);
    throw error;
  }
}

/**
 * Get user engagement metrics
 */
export async function getUserEngagementMetrics() {
  try {
    const totalUsers = await prisma.user.count();
    const usersWithPosts = await prisma.user.count({
      where: {
        posts: {
          some: {
            isDeleted: false,
          },
        },
      },
    });

    // Get actual average posts per user
    const usersWithPostCounts = await prisma.user.findMany({
      select: {
        _count: {
          select: {
            posts: {
              where: { isDeleted: false },
            },
          },
        },
      },
    });

    const totalPosts = usersWithPostCounts.reduce(
      (sum: number, user: { _count: { posts: number } }) =>
        sum + user._count.posts,
      0
    );
    const avgPostsPerUserValue = totalUsers > 0 ? totalPosts / totalUsers : 0;

    // Average votes per user
    const usersWithVoteCounts = await prisma.user.findMany({
      select: {
        _count: {
          select: { votes: true },
        },
      },
    });
    const totalVotes = usersWithVoteCounts.reduce(
      (sum: number, user: { _count: { votes: number } }) =>
        sum + user._count.votes,
      0
    );
    const avgVotesPerUser = totalUsers > 0 ? totalVotes / totalUsers : 0;

    return {
      totalUsers,
      usersWithPosts,
      signupToPostConversion:
        totalUsers > 0 ? (usersWithPosts / totalUsers) * 100 : 0,
      avgPostsPerUser: avgPostsPerUserValue,
      avgVotesPerUser,
    };
  } catch (error) {
    console.error("Error getting user engagement metrics:", error);
    throw error;
  }
}

/**
 * Get content quality metrics
 */
export async function getContentQualityMetrics() {
  try {
    const totalPosts = await prisma.post.count({
      where: { isDeleted: false },
    });

    const postsWithPositiveScore = await prisma.post.count({
      where: {
        isDeleted: false,
        score: { gt: 0 },
      },
    });

    const avgScore = await prisma.post.aggregate({
      where: { isDeleted: false },
      _avg: { score: true },
    });

    const flaggedPosts = await prisma.flag.count();
    const flagRate = totalPosts > 0 ? (flaggedPosts / totalPosts) * 100 : 0;

    // Average votes per post
    const totalVotes = await prisma.vote.count();
    const avgVotesPerPost = totalPosts > 0 ? totalVotes / totalPosts : 0;

    return {
      totalPosts,
      postsWithPositiveScore,
      positiveScoreRate:
        totalPosts > 0 ? (postsWithPositiveScore / totalPosts) * 100 : 0,
      avgScore: avgScore._avg.score || 0,
      flagRate,
      avgVotesPerPost,
    };
  } catch (error) {
    console.error("Error getting content quality metrics:", error);
    throw error;
  }
}

/**
 * Get growth metrics (MoM, WoW)
 */
export async function getGrowthMetrics() {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // This month signups
    const thisMonthSignups = await prisma.user.count({
      where: {
        createdAt: { gte: thisMonthStart },
      },
    });

    // Last month signups
    const lastMonthSignups = await prisma.user.count({
      where: {
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });

    // Week over week
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);

    const thisWeekSignups = await prisma.user.count({
      where: {
        createdAt: { gte: thisWeekStart },
      },
    });

    const lastWeekSignups = await prisma.user.count({
      where: {
        createdAt: {
          gte: lastWeekStart,
          lte: lastWeekEnd,
        },
      },
    });

    const momGrowth =
      lastMonthSignups > 0
        ? ((thisMonthSignups - lastMonthSignups) / lastMonthSignups) * 100
        : 0;
    const wowGrowth =
      lastWeekSignups > 0
        ? ((thisWeekSignups - lastWeekSignups) / lastWeekSignups) * 100
        : 0;

    return {
      thisMonthSignups,
      lastMonthSignups,
      momGrowth,
      thisWeekSignups,
      lastWeekSignups,
      wowGrowth,
    };
  } catch (error) {
    console.error("Error getting growth metrics:", error);
    throw error;
  }
}

/**
 * Get retention metrics (7-day, 30-day)
 */
export async function getRetentionMetrics() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get users who signed up 30+ days ago
    const users30DaysAgo = await prisma.user.findMany({
      where: {
        createdAt: { lte: thirtyDaysAgo },
      },
      select: { id: true, createdAt: true },
    });

    // Get users who signed up 7+ days ago
    const users7DaysAgo = await prisma.user.findMany({
      where: {
        createdAt: { lte: sevenDaysAgo },
      },
      select: { id: true, createdAt: true },
    });

    // Check 30-day retention
    let retained30Days = 0;
    for (const user of users30DaysAgo) {
      const recentActivity = await prisma.analyticsEvent.findFirst({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });
      if (recentActivity) retained30Days++;
    }

    // Check 7-day retention
    let retained7Days = 0;
    for (const user of users7DaysAgo) {
      const recentActivity = await prisma.analyticsEvent.findFirst({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });
      if (recentActivity) retained7Days++;
    }

    return {
      retention7Days:
        users7DaysAgo.length > 0
          ? (retained7Days / users7DaysAgo.length) * 100
          : 0,
      retention30Days:
        users30DaysAgo.length > 0
          ? (retained30Days / users30DaysAgo.length) * 100
          : 0,
      users7DaysAgo: users7DaysAgo.length,
      users30DaysAgo: users30DaysAgo.length,
      retained7Days,
      retained30Days,
    };
  } catch (error) {
    console.error("Error getting retention metrics:", error);
    throw error;
  }
}

/**
 * Get session duration metrics
 */
export async function getSessionMetrics() {
  try {
    // Get all session_start and session_end events
    const sessionStarts = await prisma.analyticsEvent.findMany({
      where: {
        eventType: "session_start",
        userId: { not: null },
      },
      orderBy: { createdAt: "asc" },
      select: { userId: true, createdAt: true },
    });

    const sessionEnds = await prisma.analyticsEvent.findMany({
      where: {
        eventType: "session_end",
        userId: { not: null },
      },
      orderBy: { createdAt: "asc" },
      select: { userId: true, createdAt: true },
    });

    // Calculate session durations
    const durations: number[] = [];
    const sessionMap = new Map<string, Date>();

    // Match session starts with ends
    for (const start of sessionStarts) {
      if (start.userId) {
        sessionMap.set(start.userId, start.createdAt);
      }
    }

    for (const end of sessionEnds) {
      if (end.userId) {
        const startTime = sessionMap.get(end.userId);
        if (startTime) {
          const duration =
            (end.createdAt.getTime() - startTime.getTime()) / 1000 / 60; // minutes
          if (duration > 0 && duration < 1440) {
            // Reasonable session (less than 24 hours)
            durations.push(duration);
          }
          sessionMap.delete(end.userId);
        }
      }
    }

    const avgSessionDuration =
      durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

    // Calculate actions per session (approximate)
    const totalSessions = sessionStarts.length;
    const totalActions = await prisma.analyticsEvent.count({
      where: {
        userId: { not: null },
        eventType: {
          notIn: ["session_start", "session_end"],
        },
      },
    });
    const avgActionsPerSession =
      totalSessions > 0 ? totalActions / totalSessions : 0;

    return {
      avgSessionDuration: avgSessionDuration,
      totalSessions,
      avgActionsPerSession,
      medianSessionDuration:
        durations.length > 0
          ? durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)]
          : 0,
    };
  } catch (error) {
    console.error("Error getting session metrics:", error);
    throw error;
  }
}

/**
 * Get conversion funnel metrics
 */
export async function getConversionFunnel() {
  try {
    const totalSignups = await prisma.user.count();

    // Users who completed code of honor
    const codeOfHonorAccepted = await prisma.analyticsEvent.count({
      where: { eventType: "code_of_honor_accepted" },
    });

    // Users who set username
    const usernameSetup = await prisma.analyticsEvent.count({
      where: { eventType: "username_setup_completed" },
    });

    // Users who created first post - use findMany with distinct
    const usersWithPosts = await prisma.analyticsEvent.findMany({
      where: { eventType: "post_created" },
      distinct: ["userId"],
      select: { userId: true },
    });
    const firstPost = usersWithPosts.length;

    // Users who cast first vote - use findMany with distinct
    const usersWithVotes = await prisma.analyticsEvent.findMany({
      where: { eventType: "vote_cast" },
      distinct: ["userId"],
      select: { userId: true },
    });
    const firstVote = usersWithVotes.length;

    return {
      totalSignups,
      codeOfHonorAccepted,
      codeOfHonorRate:
        totalSignups > 0 ? (codeOfHonorAccepted / totalSignups) * 100 : 0,
      usernameSetup,
      usernameSetupRate:
        totalSignups > 0 ? (usernameSetup / totalSignups) * 100 : 0,
      firstPost,
      signupToPostRate: totalSignups > 0 ? (firstPost / totalSignups) * 100 : 0,
      firstVote,
      signupToVoteRate: totalSignups > 0 ? (firstVote / totalSignups) * 100 : 0,
    };
  } catch (error) {
    console.error("Error getting conversion funnel:", error);
    throw error;
  }
}

/**
 * Get time-to-action metrics
 */
export async function getTimeToActionMetrics() {
  try {
    // Get users with their signup time and first post time
    const usersWithPosts = await prisma.user.findMany({
      where: {
        posts: {
          some: { isDeleted: false },
        },
      },
      select: {
        id: true,
        createdAt: true,
        posts: {
          where: { isDeleted: false },
          orderBy: { createdAt: "asc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    const timeToFirstPost: number[] = [];
    for (const user of usersWithPosts) {
      if (user.posts.length > 0) {
        const signupTime = user.createdAt.getTime();
        const firstPostTime = user.posts[0].createdAt.getTime();
        const hours = (firstPostTime - signupTime) / (1000 * 60 * 60);
        if (hours >= 0 && hours < 720) {
          // Reasonable time (less than 30 days)
          timeToFirstPost.push(hours);
        }
      }
    }

    const avgTimeToFirstPost =
      timeToFirstPost.length > 0
        ? timeToFirstPost.reduce((sum, t) => sum + t, 0) /
          timeToFirstPost.length
        : 0;

    // Time to first vote
    const usersWithVotes = await prisma.user.findMany({
      where: {
        votes: { some: {} },
      },
      select: {
        id: true,
        createdAt: true,
        votes: {
          orderBy: { createdAt: "asc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    const timeToFirstVote: number[] = [];
    for (const user of usersWithVotes) {
      if (user.votes.length > 0) {
        const signupTime = user.createdAt.getTime();
        const firstVoteTime = user.votes[0].createdAt.getTime();
        const hours = (firstVoteTime - signupTime) / (1000 * 60 * 60);
        if (hours >= 0 && hours < 720) {
          timeToFirstVote.push(hours);
        }
      }
    }

    const avgTimeToFirstVote =
      timeToFirstVote.length > 0
        ? timeToFirstVote.reduce((sum, t) => sum + t, 0) /
          timeToFirstVote.length
        : 0;

    return {
      avgTimeToFirstPost,
      avgTimeToFirstVote,
      medianTimeToFirstPost:
        timeToFirstPost.length > 0
          ? timeToFirstPost.sort((a, b) => a - b)[
              Math.floor(timeToFirstPost.length / 2)
            ]
          : 0,
      medianTimeToFirstVote:
        timeToFirstVote.length > 0
          ? timeToFirstVote.sort((a, b) => a - b)[
              Math.floor(timeToFirstVote.length / 2)
            ]
          : 0,
    };
  } catch (error) {
    console.error("Error getting time-to-action metrics:", error);
    throw error;
  }
}
