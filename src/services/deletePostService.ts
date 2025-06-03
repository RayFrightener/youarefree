import { prisma } from "@/lib/prisma";


export async function softDeletePost(postId: number, userId: string) {
    return prisma.post.update({
        where: { id: postId, userId },
        data: { isDeleted: true },
    });
}