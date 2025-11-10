import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { banUser } from "@/services/userModerationService";

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await context.params;

    await banUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error banning user:", error);
    return NextResponse.json({ error: "Failed to ban user" }, { status: 500 });
  }
}
