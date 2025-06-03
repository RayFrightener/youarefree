import { prisma } from "@/lib/prisma";

export async function toggleFlagPost(postId: number, userId: string) {
    const existing = await prisma.flag.findUnique({
        where: { userId_postId: { userId, postId}}
    });

    if (existing) {
        await prisma.flag.delete({
            where: { id: existing.id }
        });
        return { flagged: false }
    } else {
        await prisma.flag.create({
            data: { postId, userId }
        });
        return { flagged: true };
    }
}