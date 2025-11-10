import { prisma } from "@/lib/prisma";

export async function toggleFlagPost(postId: number, userId: string) {
  // Check if user is restricted
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });

  if (user?.status === "banned" || user?.status === "restricted") {
    throw new Error("You are not allowed to flag posts");
  }

  // Rate limiting: Check if user has flagged too many posts recently
  const recentFlags = await prisma.flag.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      },
    },
  });

  if (recentFlags >= 10) {
    throw new Error(
      "You've flagged too many posts recently. Please wait before flagging more."
    );
  }

  // Check if flag already exists
  const existing = await prisma.flag.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  let flagged: boolean;

  if (existing) {
    // Unflag
    await prisma.flag.delete({
      where: { id: existing.id },
    });
    flagged = false;
  } else {
    // Create flag
    await prisma.flag.create({
      data: { postId, userId },
    });
    flagged = true;
  }

  // Auto-moderate: Check flag count after this flag
  if (flagged) {
    const flagCount = await prisma.flag.count({
      where: { postId },
    });

    // Auto-hide if 3+ flags (adjust threshold as needed)
    if (flagCount >= 3) {
      await prisma.post.update({
        where: { id: postId },
        data: { isDeleted: true },
      });

      // Increment flag count for the post author
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { userId: true },
      });

      if (post) {
        await prisma.user.update({
          where: { id: post.userId },
          data: {
            flagCount: {
              increment: 1,
            },
          },
        });

        // Auto-restrict user if their posts get flagged too often
        const userFlagCount = await prisma.user.findUnique({
          where: { id: post.userId },
          select: { flagCount: true },
        });

        if (userFlagCount && userFlagCount.flagCount >= 5) {
          // Restrict user for 7 days
          const restrictedUntil = new Date();
          restrictedUntil.setDate(restrictedUntil.getDate() + 7);

          await prisma.user.update({
            where: { id: post.userId },
            data: {
              status: "restricted",
              restrictedUntil,
            },
          });
        }
      }
    }
  }

  return { flagged };
}
