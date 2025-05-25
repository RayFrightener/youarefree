import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { voteOnPost } from "@/services/voteService";
import { prisma } from "@/lib/prisma";
/**POST /api/votes (or PATCH): Accepts { postId, value } (value is 1 or -1).
Checks if a vote by this user for this post exists:
If not, create it.
If yes and value is different, update it.
If yes and value is the same, do nothing or remove the vote (optional).
Updates the post’s score accordingly (optional: you can recalculate on the fly or store a score field). */
//You never send the user.id from the frontend; you always get it on the backend using the session (which is secure).
export async function POST (request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
        } 
        const { postId, value } = await request.json();
        const numericPostId = Number(postId);
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id:true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found"}, { status: 404 });
        }

        const vote = await voteOnPost(numericPostId, user.id, value);
        return NextResponse.json(vote, { status: 201 });
    }   catch (error) {
        console.error("Error creating a vote", error);
        return NextResponse.json({ error: "Failed to vote on post"}, { status: 500 });
    }
}