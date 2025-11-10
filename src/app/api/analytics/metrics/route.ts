import { NextResponse } from "next/server";
import {
  getAnalyticsMetrics,
  getUserEngagementMetrics,
  getContentQualityMetrics,
  getGrowthMetrics,
  getRetentionMetrics,
  getSessionMetrics,
  getConversionFunnel,
  getTimeToActionMetrics,
} from "@/services/analyticsService";
import { isAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;

    const [
      analytics,
      engagement,
      contentQuality,
      growth,
      retention,
      sessions,
      conversion,
      timeToAction,
    ] = await Promise.all([
      getAnalyticsMetrics({ startDate, endDate }),
      getUserEngagementMetrics(),
      getContentQualityMetrics(),
      getGrowthMetrics(),
      getRetentionMetrics(),
      getSessionMetrics(),
      getConversionFunnel(),
      getTimeToActionMetrics(),
    ]);

    return NextResponse.json({
      analytics,
      engagement,
      contentQuality,
      growth,
      retention,
      sessions,
      conversion,
      timeToAction,
    });
  } catch (error) {
    console.error("Error getting analytics metrics:", error);
    return NextResponse.json(
      { error: "Failed to get metrics" },
      { status: 500 }
    );
  }
}
