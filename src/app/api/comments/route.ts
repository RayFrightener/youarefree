import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getPostComments,
  createComment,
  getCommentCount,
} from "@/services/commentService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const countOnly = searchParams.get("countOnly") === "true";

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const numericPostId = parseInt(postId, 10);
    if (isNaN(numericPostId)) {
      return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
    }

    if (countOnly) {
      const count = await getCommentCount(numericPostId);
      return NextResponse.json({ count });
    }

    const comments = await getPostComments(numericPostId);
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { postId, content, parentId } = await request.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: "postId and content are required" },
        { status: 400 }
      );
    }

    const numericPostId = parseInt(postId, 10);
    if (isNaN(numericPostId)) {
      return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
    }

    const comment = await createComment(
      numericPostId,
      user.id,
      content,
      parentId || null
    );

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create comment" },
      { status: 500 }
    );
  }
}

