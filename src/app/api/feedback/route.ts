import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createFeedback } from "@/services/feedbackService";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
    }

    const { category, message } = await request.json();
    if (!category || !message ) {
        return NextResponse.json({ error: "Missing fields"}, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) {
        return NextResponse.json({ error: "user not found"}, { status: 404 });
    }

    await createFeedback(user.id, category, message);
    return NextResponse.json({ success: true });
}