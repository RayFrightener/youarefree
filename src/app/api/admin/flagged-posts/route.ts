import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all flagged posts with their details
    const flaggedPosts = await prisma.flag.findMany({
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by postId to count how many times each post was flagged
    const flaggedPostsMap = new Map<
      number,
      {
        postId: number;
        post: (typeof flaggedPosts)[0]["post"];
        flagCount: number;
        flaggedBy: Array<{
          userId: string;
          username: string | null;
          email: string;
          flaggedAt: Date;
        }>;
        firstFlaggedAt: Date;
        lastFlaggedAt: Date;
      }
    >();

    flaggedPosts.forEach((flag: (typeof flaggedPosts)[0]) => {
      const postId = flag.postId;
      if (!flaggedPostsMap.has(postId)) {
        flaggedPostsMap.set(postId, {
          postId,
          post: flag.post,
          flagCount: 0,
          flaggedBy: [],
          firstFlaggedAt: flag.createdAt,
          lastFlaggedAt: flag.createdAt,
        });
      }
      const entry = flaggedPostsMap.get(postId)!; // Non-null assertion since we just checked/created it
      entry.flagCount++;
      entry.flaggedBy.push({
        userId: flag.user.id,
        username: flag.user.username,
        email: flag.user.email,
        flaggedAt: flag.createdAt,
      });
      if (flag.createdAt > entry.lastFlaggedAt) {
        entry.lastFlaggedAt = flag.createdAt;
      }
    });

    const flaggedPostsSummary = Array.from(flaggedPostsMap.values());

    return NextResponse.json({
      flaggedPosts: flaggedPostsSummary,
      totalFlags: flaggedPosts.length,
      uniqueFlaggedPosts: flaggedPostsSummary.length,
    });
  } catch (error) {
    console.error("Error getting flagged posts:", error);
    return NextResponse.json(
      { error: "Failed to get flagged posts" },
      { status: 500 }
    );
  }
}
