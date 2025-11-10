import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { restrictUser } from "@/services/userModerationService";

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await context.params;
    const { days = 7 } = await request.json().catch(() => ({}));

    await restrictUser(userId, days);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error restricting user:", error);
    return NextResponse.json(
      { error: "Failed to restrict user" },
      { status: 500 }
    );
  }
}
