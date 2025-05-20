/**
 * import next response
 * import service
 * export async function GET
 * destructure the request URL into searchParams
 * create a const of the searchPrams
 * try
 *  call service with argument into a const
 * "return" the const back to frontend by using nextresponse.json
 * catch
 * if error "error fetching posts: " , error
 * return next response with error always convert to json as that is the standard of sending data over internet
 */
import { NextResponse } from "next/server";
import { getPosts } from "@/services/postService";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get("sort") || "newest";
    try {
        const posts = await getPosts(sort);
        return NextResponse.json(posts);
    }
    catch (error) {
        console.error("Error fetching posts: ", error);
        return NextResponse.json({error: "failed to fetch posts" }, { status: 500 });
    }
}