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
import { auth } from "@/auth";
import { getPosts, createPost } from "@/services/postService";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get("sort") || "newest";
    let userId: string | undefined = undefined;

    try {
        const session = await auth();
        if (session?.user?.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true }
            });
            userId = user?.id;
        } 
        
    } catch {}
        
    try {
            const posts = await getPosts(sort, userId);
            return NextResponse.json(posts);
        }
    catch (error) {
        console.error("Error fetching posts: ", error);
        return NextResponse.json({error: "failed to fetch posts" }, { status: 500 });
    }
}

/**export async function POST, arg request: Request
 * try {
 *  get session}
 */
//receive a post request with content in it
export async function POST (request: Request) {
    
    try {
        //retrieve session to get user's email
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });        
        }
        //put request into body
        const body = await request.json();
        //destructure content from body
        const { content } = body;
        
        //retrive user id to associate the post with 
        const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
        });
    
        if (!user) {
            return NextResponse.json({ error: "User not found " }, { status: 404 });
        }
        
        try {
            const post = await createPost(content, user.id);
            return NextResponse.json(post, { status: 201 });
        } catch (err) {
            if (err.cooldown) {
                return NextResponse.json({
                    error: `Please wait ${Math.floor(err.secondsLeft / 60)}m ${err.secondsLeft % 60}s before posting again.`
                }, { status: 429 });
            }
            throw err;
        }
        } catch (error) {
            console.error("Error creating post: ", error);
            return NextResponse.json({ error: "Failed to create a post"}, { status: 500 });
        }
}

