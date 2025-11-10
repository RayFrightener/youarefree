import { auth } from "@/auth";

function getAdminEmails(): string[] {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return [];
  }
  // Support comma-separated emails
  return adminEmail
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return false;
    }
    const adminEmails = getAdminEmails();
    if (adminEmails.length === 0) {
      return false; // No admin emails configured
    }
    return adminEmails.includes(session.user.email);
  } catch {
    return false;
  }
}

// Export for server-side use
export function getAdminEmailsList(): string[] {
  return getAdminEmails();
}
