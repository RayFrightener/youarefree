/** service that receives a query and processes and sends it back
 * pseudocode
 * import client for use
 * create and exported async function named getPosts with a parameter sort in this case
 * function returns something from the client service
 * we use client.table.someMethod(query)
 * query structure:
 * orderBy: sort === "highest" ? {score: "desc" } : { createdAt: "desc"},
 * include: {
 *  user: {
 * select: {
 * username: true, 
 * name, true}}}
 */

import { prisma } from "@/lib/prisma";

const COOLDOWN_MINUTES = 10;

export async function getPosts(sort: string, userId?: string) {
    const posts = await prisma.post.findMany({
        where: { isDeleted: false },
        orderBy: sort === "highest" ? { score: "desc" } : { createdAt: "desc"},
        include: {
            user: {
                select: {
                    username: true, 
                    name: true
                },
            },
            votes: userId
                ? {
                    where: { userId },
                    select: { voteType: true }
                }
                : false,
        },
    });

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return posts.map((post: {votes?: { voteType: number }[];[key: string]: any;
    }) => ({
        ...post,
        currentUserVote: post.votes?.[0]?.voteType ?? 0,
        votes: undefined, // Remove raw votes array from response
    }));
}

/** POST service
 * export async function(content: string, userId: string)
 * return prisma.post.create(
 * data: content, userId
 * include: user -> -> select -> username: true, name: true)
 */

export async function createPost(content: string, userId: string) {
    //check cooldown
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { lastPostAt: true }
    });

    if (user?.lastPostAt) {
        const now = new Date();
        const last = new Date(user.lastPostAt);

        const diffMs = now.getTime() - last.getTime();
        if (diffMs < COOLDOWN_MINUTES * 60 * 1000) {
            const secondsLeft = Math.ceil((COOLDOWN_MINUTES * 60 * 1000 - diffMs) / 1000);
            throw { cooldown: true, secondsLeft};
        }
    }

    const post = await prisma.post.create({
        data: {
            content,
            userId
        }, 
        include: {
            user: {
                select: {
                    username: true,
                    name: true,
                },
            },
        },
    });

    await prisma.user.update({
        where: { id: userId },
        data: { lastPostAt: new Date() }
    });

    return post;
}