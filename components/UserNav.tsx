"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("authToken");
      const raw = localStorage.getItem("user");
      if (token && raw) {
        setUser(JSON.parse(raw));
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    }
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      // Logout API call failed - continue with local cleanup
    }

    try {
      // Clear client-side storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");

      // Attempt to clear cookie on client as well (if not HttpOnly)
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch (e) {
      // ignore
    }

    router.push("/");
    setIsMenuOpen(false);
  }

  const Links = (
    <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-4">
      <Link
        href="/configurations"
        className="text-sm text-slate-200 transition hover:text-emerald-300"
        onClick={() => setIsMenuOpen(false)}
      >
        Configurations
      </Link>
      {user ? (
        <>
          <Link
            href="/profile"
            className="text-sm text-slate-200 transition hover:text-emerald-300"
            onClick={() => setIsMenuOpen(false)}
          >
            {user.name ? user.name : user.email}
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-300 hover:text-rose-400"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="text-sm text-slate-300 transition hover:text-emerald-400"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            onClick={() => setIsMenuOpen(false)}
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  );

  return (
    <nav className="relative">
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-500/60 hover:text-emerald-300"
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div
        className={`absolute right-0 z-20 mt-3 w-56 rounded-xl border border-slate-800 bg-slate-900/95 p-4 shadow-lg md:static md:mt-0 md:w-auto md:border-0 md:bg-transparent md:p-0 md:shadow-none ${
          isMenuOpen ? "block" : "hidden md:block"
        }`}
      >
        {Links}
      </div>
    </nav>
  );
}
