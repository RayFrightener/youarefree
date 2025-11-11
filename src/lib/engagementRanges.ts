/**
 * Convert numeric score to range-based text
 * Aligns with Unbound's philosophy of avoiding exact metrics
 */
export function getEngagementRange(score: number): string {
  if (score <= 0) {
    return "";
  }
  if (score <= 5) {
    return "Few people found this valuable";
  }
  if (score <= 20) {
    return "Some people resonated";
  }
  return "Many were uplifted";
}

/**
 * Get short range text for UI display
 */
export function getShortRange(score: number): string {
  if (score <= 0) {
    return "";
  }
  if (score <= 5) {
    return "Few";
  }
  if (score <= 20) {
    return "Some";
  }
  return "Many";
}

/**
 * Get emoji for range (optional visual indicator)
 */
export function getRangeEmoji(score: number): string {
  if (score <= 0) {
    return "";
  }
  if (score <= 5) {
    return "🌱";
  }
  if (score <= 20) {
    return "🌿";
  }
  return "🌳";
}

