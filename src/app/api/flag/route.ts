/**receive postId
 * retrive userId
 * call flagService functionj
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { toggleFlagPost } from "@/services/flagService";

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
    }
    const { postId  } = await request.json();
    if (!postId) {
        return NextResponse.json({ error: "Missing post ID"}, { status: 400});
    }
    const result = await toggleFlagPost(postId, session.user.id);
    return NextResponse.json({ flagged: result.flagged })
} 