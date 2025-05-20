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

export async function getPosts(sort: string) {
    return prisma.post.findMany({
        orderBy: sort === "highest" ? { score: "desc" } : { createdAt: "desc"},
        include: {
            user: {
                select: {
                    username: true, 
                    name: true
                },
            },
        },
    });
}