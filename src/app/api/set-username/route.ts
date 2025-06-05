import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = await request.json();
  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  // Check if username is already taken
    const existing = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
      select: { id: true },
    });
  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  // Update the user's username
  await prisma.user.update({
    where: { email: session.user.email },
    data: { username },
  });

  return NextResponse.json({ success: true });
}