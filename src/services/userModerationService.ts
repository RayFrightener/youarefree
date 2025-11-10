import { prisma } from "@/lib/prisma";

/**
 * Ban a user permanently
 */
export async function banUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "banned",
    },
  });

  // Soft-delete all their posts
  await prisma.post.updateMany({
    where: { userId },
    data: { isDeleted: true },
  });
}

/**
 * Restrict a user temporarily
 */
export async function restrictUser(userId: string, days: number = 7) {
  const restrictedUntil = new Date();
  restrictedUntil.setDate(restrictedUntil.getDate() + days);

  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "restricted",
      restrictedUntil,
    },
  });
}

/**
 * Restore user to active status
 */
export async function restoreUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "active",
      restrictedUntil: null,
      flagCount: 0, // Reset flag count
    },
  });
}

/**
 * Get user moderation status
 */
export async function getUserModerationStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      status: true,
      flagCount: true,
      restrictedUntil: true,
      createdAt: true,
      posts: {
        where: { isDeleted: false },
        select: {
          id: true,
          score: true,
          flags: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!user) return null;

  const totalFlags = user.posts.reduce(
    (
      sum: number,
      post: { id: number; score: number; flags: { id: number }[] }
    ) => sum + post.flags.length,
    0
  );
  const avgScore =
    user.posts.length > 0
      ? user.posts.reduce(
          (
            sum: number,
            post: { id: number; score: number; flags: { id: number }[] }
          ) => sum + post.score,
          0
        ) / user.posts.length
      : 0;

  return {
    ...user,
    totalFlags,
    avgScore,
    postCount: user.posts.length,
  };
}
