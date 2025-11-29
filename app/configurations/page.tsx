import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import UserNav from "@/components/UserNav";
import ConfigHistoryList from "@/components/ConfigHistoryList";

export default function ConfigurationsPage() {
  return (
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

          <div className="flex items-center gap-6">
            <Link
              href="/configurator"
              className="text-sm text-slate-300 transition hover:text-emerald-400"
            >
              ← Back to Configurator
            </Link>
            <UserNav />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
        {/* Header */}
        <header className="space-y-4 mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Configuration History
          </p>
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
            Previously Generated Hardware Configurations
          </h1>
          <p className="text-base text-slate-300 md:text-lg">
            Review your past recommendations, pricing, AI summaries, and
            procurement-ready system builds.
          </p>
        </header>

        <AuthGuard>
          <ConfigHistoryList />
        </AuthGuard>
      </div>
    </div>
  );
}
