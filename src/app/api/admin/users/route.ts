import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users with their moderation stats
    const users = await prisma.user.findMany({
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
        flags: {
          select: { id: true },
        },
      },
      // Remove orderBy from Prisma query - we'll sort in JavaScript
    });

    // Sort by flag count after fetching
    users.sort(
      (a: (typeof users)[0], b: (typeof users)[0]) =>
        (b.flagCount || 0) - (a.flagCount || 0)
    );

    // Calculate troll score and enrich user data
    const usersWithStats = users.map((user: (typeof users)[0]) => {
      const totalPostFlags = user.posts.reduce(
        (sum: number, post: (typeof user.posts)[0]) => sum + post.flags.length,
        0
      );
      const avgPostScore =
        user.posts.length > 0
          ? user.posts.reduce(
              (sum: number, post: (typeof user.posts)[0]) => sum + post.score,
              0
            ) / user.posts.length
          : 0;
      const totalPosts = user.posts.length;

      // Calculate troll score (0-100, higher = more problematic)
      // Factors:
      // - High flag count (40% weight)
      // - Low average post score (30% weight)
      // - High flag-to-post ratio (30% weight)
      const flagScore = Math.min((user.flagCount / 10) * 40, 40); // Max 40 points
      const scorePenalty = avgPostScore < 0 ? Math.abs(avgPostScore) * 3 : 0; // Max 30 points
      const flagRatio = totalPosts > 0 ? (totalPostFlags / totalPosts) * 30 : 0; // Max 30 points

      const trollScore = Math.min(
        Math.round(flagScore + scorePenalty + flagRatio),
        100
      );

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        flagCount: user.flagCount,
        restrictedUntil: user.restrictedUntil,
        createdAt: user.createdAt,
        stats: {
          totalPosts,
          totalPostFlags,
          avgPostScore: Math.round(avgPostScore * 10) / 10,
          trollScore,
          isTroll: trollScore >= 50, // Flag as troll if score >= 50
        },
      };
    });

    // Separate by status
    const activeUsers = usersWithStats.filter(
      (u: (typeof usersWithStats)[0]) => u.status === "active"
    );
    const restrictedUsers = usersWithStats.filter(
      (u: (typeof usersWithStats)[0]) => u.status === "restricted"
    );
    const bannedUsers = usersWithStats.filter(
      (u: (typeof usersWithStats)[0]) => u.status === "banned"
    );
    const trolls = usersWithStats.filter(
      (u: (typeof usersWithStats)[0]) =>
        u.stats.isTroll && u.status !== "banned"
    );

    return NextResponse.json({
      users: usersWithStats,
      activeUsers,
      restrictedUsers,
      bannedUsers,
      trolls,
      totalUsers: usersWithStats.length,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 });
  }
}
