type EventType =
  | "page_view"
  | "post_created"
  | "vote_cast"
  | "post_deleted"
  | "flag_created"
  | "feedback_submitted"
  | "session_start"
  | "session_end"
  | "profile_view"
  | "username_setup_completed"
  | "code_of_honor_accepted"
  | "sign_in"
  | "sign_out"
  | "feed_sort_changed"
  | "navigation_hint_dismissed"
  | "resonance_mode_selected"
  | "resonance_post_viewed"
  | "quiet_moment_shown"
  | "quiet_moment_engaged"
  | "quiet_moment_bookmarked"
  | "focus_mode_enabled"
  | "focus_mode_disabled"
  | "focus_mode_duration"
  | "reading_time_displayed"
  | "post_reading_time_actual"
  | "bookmark_toggled";

interface TrackEventOptions {
  postId?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Track an analytics event from the client
 */
export async function track(eventType: EventType, options?: TrackEventOptions) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType,
        postId: options?.postId,
        metadata: options?.metadata,
      }),
    });
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.error("Analytics tracking failed:", error);
  }
}
