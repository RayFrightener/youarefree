import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
    //1. get the current session
    const session = await auth();
    //2. if not loggen in return 401
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //3. Get user from DB
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true, 
            email: true,
            name: true,
            username: true,
            posts: {
                where: { isDeleted: false }, // Only show non-deleted posts
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    content: true,
                    score: true,
                    createdAt: true,
                }
            }
        },
    });

    //4. if user not found, return 404
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate karma: sum of positive scores from user's posts
const karma = user.posts.reduce((sum, post) => {
    return sum + (post.score > 0 ? post.score : 0);
}, 0);
    return NextResponse.json({...user, karma});
}