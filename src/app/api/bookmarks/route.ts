import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  toggleBookmark,
  isBookmarked,
  getUserBookmarks,
} from "@/services/bookmarkService";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (postId) {
      // Check if specific post is bookmarked
      const bookmarked = await isBookmarked(parseInt(postId, 10), user.id);
      return NextResponse.json({ bookmarked });
    }

    // Get all bookmarks
    const bookmarks = await getUserBookmarks(user.id);
    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
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

    const { postId } = await request.json();

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

    const result = await toggleBookmark(numericPostId, user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}

