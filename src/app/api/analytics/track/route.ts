import { NextResponse } from "next/server";
import { trackEvent, EventType } from "@/services/analyticsService";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventType, postId, metadata } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: "eventType is required" },
        { status: 400 }
      );
    }

    // Get user if authenticated
    let userId: string | undefined = undefined;
    try {
      const session = await auth();
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        userId = user?.id;
      }
    } catch {
      // User not authenticated, that's okay for analytics
    }

    await trackEvent(eventType as EventType, {
      userId,
      postId,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking analytics event:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
