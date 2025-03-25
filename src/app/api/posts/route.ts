import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Post } from "@prisma/client";

//fetch posts for feed for "newest" and "highestscore"
// Get request from frontend with request object 
export async function GET(request: Request): Promise<NextResponse> {
    //destructure searchParams from request.url
    const { searchParams } = new URL(request.url);
    //assign value of sort searchParam 
    const sort = searchParams.get("sort") || "newest"; //default to newest

    try {
        //fetch posts from db using the searchParam
        const posts: Post[] = await prisma.post.findMany({
            orderBy: sort === "highest" ? { score: "desc" } : { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        username: true,
                        name: true,
                    },
                },
            },
        });

        //return send fetched data as JSON response
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}