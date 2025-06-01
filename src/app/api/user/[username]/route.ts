import { NextResponse } from "next/server";
import { getUserProfileWithPosts } from "@/services/userService";

export async function GET(
    request: Request,
    { params }: { params: { username: string } }
) {
    const { username } = await params;
    if (!username) {
        return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const sort = (searchParams.get("sort") as "newest" | "highest") || "newest";

    const profile = await getUserProfileWithPosts(username, sort);

    if (!profile) {
        return NextResponse.json({ error: "User not found"}, {status: 404 });
    }

    return NextResponse.json(profile);
}