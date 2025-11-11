/** service that receives a query and processes and sends it back
 * pseudocode
 * import client for use
 * create and exported async function named getPosts with a parameter sort in this case
 * function returns something from the client service
 * we use client.table.someMethod(query)
 * query structure:
 * orderBy: sort === "highest" ? {score: "desc" } : { createdAt: "desc"},
 * include: {
 *  user: {
 * select: {
 * username: true,
 * name, true}}}
 */

import { prisma } from "@/lib/prisma";

const COOLDOWN_MINUTES = 10;

// Server-side banned words validation
function containsBannedWords(input: string): boolean {
  const bannedWords = new Set([
    "shit",
    "fuck",
    "bitch",
    "hate",
    "racist",
    "slur",
    "kill",
    "nazi",
    "rape",
    "porn",
    "pussy",
    "dick",
    "cock",
    "vagina",
    "penis",
    "boobs",
    "tits",
    "nipple",
    "ass",
    "butt",
    "cum",
    "ejaculate",
    "orgasm",
    "anal",
    "sex",
    "horny",
    "bang",
    "nude",
    "nudes",
    "naked",
    "thong",
    "fetish",
    "bastard",
    "asshole",
    "dumb",
    "stupid",
    "retard",
    "idiot",
    "crap",
    "damn",
    "fucking",
    "fucked",
    "murder",
    "suicide",
    "hang",
    "die",
    "stab",
    "shoot",
    "gun",
    "bomb",
    "explode",
    "terrorist",
    "chink",
    "nigger",
    "faggot",
    "kike",
    "tranny",
    "whore",
    "slut",
  ]);
  const words = input.toLowerCase().split(/\s+/);
  return words.some((word) => bannedWords.has(word));
}

// Check for duplicate content (spam prevention)
async function isDuplicateContent(
  content: string,
  userId: string
): Promise<boolean> {
  const recentPosts = await prisma.post.findMany({
    where: {
      userId,
      isDeleted: false, // Only check non-deleted posts
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
    select: { content: true },
  });

  // Check for very similar content (exact match)
  const normalized = content.toLowerCase().trim();
  return recentPosts.some(
    (post: { content: string }) =>
      post.content.toLowerCase().trim() === normalized
  );
}

// Check if user is restricted or banned
async function isUserRestricted(userId: string): Promise<{
  restricted: boolean;
  reason?: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      status: true,
      restrictedUntil: true,
    },
  });

  if (!user) {
    return { restricted: true, reason: "User not found" };
  }

  if (user.status === "banned") {
    return { restricted: true, reason: "Your account has been banned" };
  }

  if (user.status === "restricted") {
    if (user.restrictedUntil && user.restrictedUntil > new Date()) {
      return {
        restricted: true,
        reason: `You are temporarily restricted until ${user.restrictedUntil.toLocaleDateString()}`,
      };
    }
    // Restriction expired, restore to active
    await prisma.user.update({
      where: { id: userId },
      data: { status: "active", restrictedUntil: null },
    });
  }

  return { restricted: false };
}

/**
 * Calculate resonance score for a post
 * Resonance = sustained engagement over time, not just viral spikes
 */
function calculateResonanceScore(
  post: {
    score: number;
    createdAt: Date;
    _count?: { comments?: number; votes?: number };
  },
  commentCount: number
): number {
  const now = new Date();
  const postAgeHours =
    (now.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60);

  // Total engagement (votes + comments weighted higher)
  const totalEngagement = post.score + commentCount * 2;

  // Time decay - recent engagement weighted higher, but older posts still count
  const timeDecay = 1 / (postAgeHours + 1);

  // Days with activity (simplified: if post is older than 1 day and has engagement)
  const daysWithActivity = postAgeHours > 24 && totalEngagement > 0 ? 1 : 0;

  // Resonance formula: (engagement × time_decay) / (age + 1) × (1 + sustained_activity)
  const resonanceScore =
    ((totalEngagement * timeDecay) / (postAgeHours + 1)) *
    (1 + daysWithActivity);

  return resonanceScore;
}

export async function getPosts(sort: string, userId?: string) {
  let posts;

  if (sort === "resonance") {
    // For resonance mode, we need to fetch all posts with comment counts
    posts = await prisma.post.findMany({
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
            comments: {
              where: { isDeleted: false },
            },
            votes: true,
          },
        },
      },
    });

    // Calculate resonance scores and sort
    const postsWithResonance = await Promise.all(
      posts.map(
        async (post: {
          score: number;
          createdAt: Date;
          _count?: { comments?: number; votes?: number };
          [key: string]: unknown;
        }) => {
          const commentCount = post._count?.comments || 0;
          const resonanceScore = calculateResonanceScore(post, commentCount);
          return {
            ...post,
            resonanceScore,
          };
        }
      )
    );

    // Sort by resonance score
    postsWithResonance.sort((a, b) => b.resonanceScore - a.resonanceScore);
    posts = postsWithResonance;
  } else {
    // Standard sorting (highest or newest)
    posts = await prisma.post.findMany({
      where: { isDeleted: false },
      orderBy: sort === "highest" ? { score: "desc" } : { createdAt: "desc" },
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

  return posts.map(
    (post: { votes?: { voteType: number }[]; [key: string]: unknown }) => ({
      ...post,
      currentUserVote: post.votes?.[0]?.voteType ?? 0,
      votes: undefined, // Remove raw votes array from response
      resonanceScore: undefined, // Remove resonance score from response
    })
  );
}

/** POST service
 * export async function(content: string, userId: string)
 * return prisma.post.create(
 * data: content, userId
 * include: user -> -> select -> username: true, name: true)
 */
export async function createPost(content: string, userId: string) {
  // Check if user is restricted or banned
  const userCheck = await isUserRestricted(userId);
  if (userCheck.restricted) {
    throw new Error(userCheck.reason || "You are not allowed to post");
  }

  // Check cooldown
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastPostAt: true },
  });

  if (user?.lastPostAt) {
    const now = new Date();
    const last = new Date(user.lastPostAt);

    const diffMs = now.getTime() - last.getTime();
    if (diffMs < COOLDOWN_MINUTES * 60 * 1000) {
      const secondsLeft = Math.ceil(
        (COOLDOWN_MINUTES * 60 * 1000 - diffMs) / 1000
      );
      throw { cooldown: true, secondsLeft };
    }
  }

  // Server-side banned words validation
  if (containsBannedWords(content)) {
    throw new Error("Your expression contains inappropriate language.");
  }

  // Check for duplicate content
  if (await isDuplicateContent(content, userId)) {
    throw new Error("You've posted similar content recently.");
  }

  const post = await prisma.post.create({
    data: {
      content,
      userId,
    },
    include: {
      user: {
        select: {
          username: true,
          name: true,
        },
      },
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { lastPostAt: new Date() },
  });

  return post;
}
