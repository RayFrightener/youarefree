import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    if (!username) {
        return NextResponse.json({ available: false });
    }
    const user = await prisma.user.findUnique({
        where: { username: username.toLowerCase () },
        select: { id: true },
    });
    return NextResponse.json({ available: !user });
}