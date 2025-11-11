import { NextResponse } from "next/server";
import {
  getTodayReflectionsCount,
  getTodaysResonatingPost,
} from "@/services/communityService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "reflections") {
      const count = await getTodayReflectionsCount();
      return NextResponse.json({ count });
    }

    if (type === "resonating") {
      const post = await getTodaysResonatingPost();
      return NextResponse.json(post);
    }

    // Return both by default
    const [reflectionsCount, resonatingPost] = await Promise.all([
      getTodayReflectionsCount(),
      getTodaysResonatingPost(),
    ]);

    return NextResponse.json({
      reflectionsCount,
      resonatingPost,
    });
  } catch (error) {
    console.error("Error fetching community data:", error);
    return NextResponse.json(
      { error: "Failed to fetch community data" },
      { status: 500 }
    );
  }
}

