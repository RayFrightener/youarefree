import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { softDeletePost } from "@/services/deletePostService";

export async function POST(request: Request, { params }: { params: Record<string, string> }
) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({error: "Unauthorized"}, { status: 401 });
    }

    const postId = Number(params.postId);
    if (isNaN(postId)) {
        return NextResponse.json({ error: "Invalid post ID"}, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) {
        return NextResponse.json({ error: "User not found"}, { status: 404 });
    }

    try {
        await softDeletePost(postId, user.id);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}