import { prisma } from "@/lib/prisma";

export async function createFeedback(userId: string, category: string, message: string) {
    return prisma.feedback.create({
        data: {
            userId,
            category,
            message,
        },
    });
}