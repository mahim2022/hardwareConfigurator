"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
  updated_at?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/auth/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setUser(data.user);
      setName(data.user.name || "");
      setEmail(data.user.email);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }

      setUser(data.user);
      setMessage("Profile updated successfully!");
      setEditing(false);

      // Update localStorage user
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to change password");
        return;
      }

      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-white">
        {/* Navigation */}
        <nav className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/20 text-xl font-bold text-emerald-400">
                R
              </div>
              <span className="text-xl font-semibold">Rain Computers</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/configurator"
                className="text-sm text-slate-300 transition hover:text-emerald-400"
              >
                Configurator
              </Link>
              <Link
                href="/"
                className="text-sm text-slate-300 transition hover:text-emerald-400"
              >
                Home
              </Link>
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-2xl px-6 py-16 lg:py-24">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold">My Profile</h1>
              <p className="text-slate-400">View and manage your account information</p>
            </div>

            {message && (
              <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Profile Info Card */}
            {!editing && !changingPassword && user && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 space-y-6">
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-lg font-semibold">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Name</p>
                  <p className="text-lg font-semibold">{user.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Member Since</p>
                  <p className="text-lg font-semibold">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {/* Edit Profile Form */}
            {editing && !changingPassword && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setName(user?.name || "");
                        setEmail(user?.email || "");
                        setError("");
                      }}
                      className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Change Password Form */}
            {changingPassword && !editing && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white"
                      placeholder="••••••••"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white font-semibold rounded-lg transition"
                    >
                      {saving ? "Updating..." : "Update Password"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChangingPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setError("");
                      }}
                      className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
