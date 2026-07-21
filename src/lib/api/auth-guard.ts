import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";

type AuthenticatedUser = {
  id: string;
  role: UserRole;
  username: string | null;
};

export async function requireAuth(): Promise<AuthenticatedUser | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    role: session.user.role,
    username: session.user.username,
  };
}

export function isAdmin(role: UserRole) {
  return role === UserRole.ADMIN || role === UserRole.MODERATOR;
}
