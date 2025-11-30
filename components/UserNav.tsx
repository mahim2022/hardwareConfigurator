"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

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
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/configurations"
          className="text-sm text-slate-300 transition hover:text-emerald-400"
        >
          Configurations
        </Link>
        <Link
          href="/login"
          className="text-sm text-slate-300 transition hover:text-emerald-400"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="rounded-lg bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/configurations"
        className="text-sm text-slate-200 transition hover:text-emerald-300"
      >
        Configurations
      </Link>
      <Link
        href="/profile"
        className="text-sm text-slate-200 transition hover:text-emerald-300"
      >
        {user.name ? user.name : user.email}
      </Link>
      <button
        onClick={handleLogout}
        className="text-sm text-slate-300 hover:text-rose-400"
      >
        Logout
      </button>
    </div>
  );
}
