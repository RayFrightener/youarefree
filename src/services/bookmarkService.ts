import { prisma } from "@/lib/prisma";

/**
 * Toggle bookmark for a post
 */
export async function toggleBookmark(
  postId: number,
  userId: string
): Promise<{ bookmarked: boolean }> {
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existing) {
    // Remove bookmark
    await prisma.bookmark.delete({
      where: {
        id: existing.id,
      },
    });
    return { bookmarked: false };
  } else {
    // Add bookmark
    await prisma.bookmark.create({
      data: {
        userId,
        postId,
      },
    });
    return { bookmarked: true };
  }
}

/**
 * Check if a post is bookmarked by a user
 */
export async function isBookmarked(
  postId: number,
  userId: string
): Promise<boolean> {
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });
  return !!bookmark;
}

/**
 * Get all bookmarks for a user
 */
export async function getUserBookmarks(userId: string) {
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
    },
    include: {
      post: {
        include: {
          user: {
            select: {
              username: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return bookmarks.map((bookmark) => ({
    id: bookmark.id,
    postId: bookmark.postId,
    createdAt: bookmark.createdAt,
    post: {
      id: bookmark.post.id,
      content: bookmark.post.content,
      score: bookmark.post.score,
      createdAt: bookmark.post.createdAt,
      user: bookmark.post.user,
    },
  }));
}

