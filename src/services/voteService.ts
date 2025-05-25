import { prisma } from "@/lib/prisma";

export async function voteOnPost(postId: number, userId: string, value: number) {
    const existing = await prisma.vote.findUnique({
        where: {
            userId_postId: {
                userId,
                postId,
            },
        },
    });

    if (!existing) {
         const vote = await prisma.vote.create({
            data: {
                userId,
                postId,
                voteType: value,
            },
         });
         //update post score
         await prisma.post.update({
            where: { id: postId },
            data: {score: { increment: value } },
         });
         return vote;
    } else if(existing.voteType !== value) {
        //vote exists but is different, update it
        const diff = value - existing.voteType;
        const vote = await prisma.vote.update({
            where: { id: existing.id },
            data: { voteType: value },
        });
        //update post score accordingly
        await prisma.post.update({
            where: {id: postId },
            data: {score: {increment: diff } },
        });
        return vote;
    } else {
        //vote exists and is the same, remove it(toggle off)
        await prisma.vote.delete({
            where: { id: existing.id },
        });
        //decrement post score by value
        await prisma.post.update({
            where: {id: postId},
            data: {score: {decrement: value} },
        });
        return null;
    }
}