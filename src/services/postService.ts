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

export async function getPosts(sort: string, userId?: string) {
    const posts = await prisma.post.findMany({
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

    // Add currentUserVote to each post
    return posts.map(post => ({
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
    return prisma.post.create({
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
}