// receives username
import { prisma } from "@/lib/prisma";

export async function getUserProfileWithPosts(
  username: string,
  sort: "newest" | "highest" = "newest"
) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      posts: {
        where: { score: { gte: 1 } },
        orderBy: sort === "highest" ? { score: "desc" } : { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          score: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) return null;

  const posts = Array.isArray(user.posts) ? user.posts : [];
  const karma = posts.reduce(
    (sum: number, post: { score: number }) => sum + post.score,
    0
  );

  return {
    username: user.username,
    name: user.name,
    karma,
    posts: user.posts,
  };
}
