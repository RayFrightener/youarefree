import { prisma } from "@/lib/prisma";

export interface CommentWithReplies {
  id: number;
  content: string;
  userId: string;
  postId: number;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    username: string | null;
    name: string | null;
  };
  replies: CommentWithReplies[];
}

/**
 * Get all comments for a post, organized hierarchically
 * Fetches all comments flat and builds the tree structure in memory
 * This supports infinite nesting depth
 */
export async function getPostComments(
  postId: number
): Promise<CommentWithReplies[]> {
  // Fetch all comments for this post in a single query
  const allComments = await prisma.comment.findMany({
    where: {
      postId,
      isDeleted: false,
    },
    include: {
      user: {
        select: {
          username: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Build a map of comments by ID for quick lookup
  const commentMap = new Map<number, CommentWithReplies>();
  allComments.forEach(
    (comment: {
      id: number;
      content: string;
      userId: string;
      postId: number;
      parentId: number | null;
      createdAt: Date;
      updatedAt: Date;
      user: {
        username: string | null;
        name: string | null;
      };
    }) => {
      commentMap.set(comment.id, {
        ...comment,
        replies: [],
      } as CommentWithReplies);
    }
  );

  // Build the tree structure
  const rootComments: CommentWithReplies[] = [];

  allComments.forEach(
    (comment: {
      id: number;
      parentId: number | null;
    }) => {
      const commentWithReplies = commentMap.get(comment.id)!;

      if (comment.parentId === null) {
        // This is a root-level comment
        rootComments.push(commentWithReplies);
      } else {
        // This is a reply - add it to its parent's replies array
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      }
    }
  );

  return rootComments;
}

/**
 * Create a new comment
 */
export async function createComment(
  postId: number,
  userId: string,
  content: string,
  parentId?: number | null
): Promise<CommentWithReplies> {
  // Validate content length (minimum 10 characters for quality)
  if (content.trim().length < 10) {
    throw new Error("Comment must be at least 10 characters long");
  }

  // Check if user is restricted
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true, restrictedUntil: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "banned") {
    throw new Error("Your account has been banned");
  }

  if (user.status === "restricted") {
    if (user.restrictedUntil && user.restrictedUntil > new Date()) {
      throw new Error(
        `You are temporarily restricted until ${user.restrictedUntil.toLocaleDateString()}`
      );
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      userId,
      postId,
      parentId: parentId || null,
    },
    include: {
      user: {
        select: {
          username: true,
          name: true,
        },
      },
      replies: [],
    },
  });

  return comment as CommentWithReplies;
}

/**
 * Delete a comment (soft delete)
 */
export async function deleteComment(
  commentId: number,
  userId: string
): Promise<void> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== userId) {
    throw new Error("You can only delete your own comments");
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { isDeleted: true },
  });
}

/**
 * Get comment count for a post (for display purposes)
 */
export async function getCommentCount(postId: number): Promise<number> {
  return await prisma.comment.count({
    where: {
      postId,
      isDeleted: false,
    },
  });
}

