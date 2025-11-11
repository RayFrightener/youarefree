import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteComment } from "@/services/commentService";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;
    const commentId = parseInt(id, 10);
    if (isNaN(commentId)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
    }

    await deleteComment(commentId, user.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting comment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete comment";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

