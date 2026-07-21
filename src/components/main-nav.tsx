import Link from "next/link";
import { auth } from "@/lib/auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/app", label: "Diary" },
  { href: "/discover", label: "Discover" },
  { href: "/recommendations", label: "Recommendations" },
];

export default async function MainNav() {
  const session = await auth();

  return (
    <header className="site-header">
      <div className="shell nav-inner">
        <Link href="/" className="brand-mark">
          CineJournal
        </Link>

        <nav className="nav-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-user">
          {session?.user?.username ? (
            <Link href={`/profile/${session.user.username}`}>@{session.user.username}</Link>
          ) : null}
          <Link href={session ? "/api/auth/signout" : "/login"}>{session ? "Sign out" : "Sign in"}</Link>
        </div>
      </div>
    </header>
  );
}
