"use client";

import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/20 text-xl font-bold text-emerald-400">
              R
            </div>
            <span className="text-xl font-semibold">Rain Computers</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm text-slate-300 transition hover:text-emerald-400"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-slate-300 transition hover:text-emerald-400"
            >
              How It Works
            </Link>
            <Link
              href="/configurator"
              className="rounded-lg bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Launch Configurator
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            <span className="size-2 animate-pulse rounded-full bg-emerald-400"></span>
            Enterprise Hardware Solutions
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight lg:text-7xl">
            Intelligent Hardware
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Configuration
            </span>
            <br />
            for Modern Teams
          </h1>
          <p className="mb-10 text-xl text-slate-300 lg:text-2xl">
            Transform your procurement workflow with AI-powered hardware recommendations.
            Built for enterprises, optimized for bulk procurement.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/configurator"
              className="rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-slate-950 transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/50"
            >
              Start Configuring →
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-4 text-base font-semibold text-white transition hover:border-emerald-500/50 hover:bg-slate-800"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2">
          <div className="size-96 rounded-full bg-emerald-500/20 blur-3xl"></div>
        </div>
        <div className="pointer-events-none absolute right-0 top-1/2 -z-10 -translate-y-1/2">
          <div className="size-96 rounded-full bg-cyan-500/20 blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">Why Rain Computers?</h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Our flagship Hardware Configurator combines rule-based intelligence with AI reasoning
            to deliver precision-matched solutions for your procurement needs.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition hover:border-emerald-500/50 hover:bg-slate-900/80">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl">
              ⚡
            </div>
            <h3 className="mb-3 text-xl font-semibold">AI-Powered Recommendations</h3>
            <p className="text-slate-400">
              Leverage Claude 3.5 Sonnet to get intelligent hardware suggestions with detailed
              reasoning and alternative options.
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition hover:border-emerald-500/50 hover:bg-slate-900/80">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl">
              🎯
            </div>
            <h3 className="mb-3 text-xl font-semibold">Requirement-Driven</h3>
            <p className="text-slate-400">
              Input structured requirements—usage type, budget, quantity, software needs—and get
              perfectly matched configurations.
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition hover:border-emerald-500/50 hover:bg-slate-900/80">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl">
              📦
            </div>
            <h3 className="mb-3 text-xl font-semibold">Bulk Procurement Ready</h3>
            <p className="text-slate-400">
              Designed for enterprise-scale deployments. Handle quantities from single units to
              200+ device rollouts with scaling insights.
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition hover:border-emerald-500/50 hover:bg-slate-900/80">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl">
              🔧
            </div>
            <h3 className="mb-3 text-xl font-semibold">Rule-Based Foundation</h3>
            <p className="text-slate-400">
              Deterministic baseline specs derived from industry best practices, then enhanced with
              AI reasoning for edge cases.
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition hover:border-emerald-500/50 hover:bg-slate-900/80">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl">
              💼
            </div>
            <h3 className="mb-3 text-xl font-semibold">Enterprise Focused</h3>
            <p className="text-slate-400">
              Built for procurement teams, not retail shoppers. Includes warranty, compliance, and
              support considerations.
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition hover:border-emerald-500/50 hover:bg-slate-900/80">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl">
              🚀
            </div>
            <h3 className="mb-3 text-xl font-semibold">Fast & Accurate</h3>
            <p className="text-slate-400">
              Generate comprehensive hardware configurations in seconds. No more manual
              quote-building or endless vendor comparisons.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold">How It Works</h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Three simple steps to get your optimal hardware configuration
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="relative">
            <div className="absolute -left-4 top-0 flex size-12 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-slate-950 md:-left-8">
              1
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 pt-12">
              <h3 className="mb-3 text-xl font-semibold">Fill Requirements</h3>
              <p className="text-slate-400">
                Provide usage type, budget range, quantity, form factor, required software, and
                performance priorities. Add optional constraints for storage, networking, warranty,
                and compliance.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-4 top-0 flex size-12 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-slate-950 md:-left-8">
              2
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 pt-12">
              <h3 className="mb-3 text-xl font-semibold">AI Processing</h3>
              <p className="text-slate-400">
                Our rule engine generates a baseline spec, then OpenRouter AI (Claude 3.5 Sonnet)
                refines it with reasoning, price estimates, and alternative configurations.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-4 top-0 flex size-12 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-slate-950 md:-left-8">
              3
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 pt-12">
              <h3 className="mb-3 text-xl font-semibold">Get Results</h3>
              <p className="text-slate-400">
                Receive a complete configuration with CPU, GPU, RAM, storage, networking specs,
                price estimates, bulk scaling notes, and alternative options—ready for procurement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent)]"></div>
          <div className="relative z-10">
            <h2 className="mb-4 text-4xl font-bold">Ready to Transform Your Procurement?</h2>
            <p className="mb-8 mx-auto max-w-2xl text-lg text-slate-300">
              Start using the Hardware Configurator today and experience intelligent,
              requirement-driven hardware recommendations.
            </p>
            <Link
              href="/configurator"
              className="inline-block rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-slate-950 transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/50"
            >
              Launch Configurator Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/20 text-xl font-bold text-emerald-400">
                  R
                </div>
                <span className="text-xl font-semibold">Rain Computers</span>
              </div>
              <p className="text-sm text-slate-400">
                Enterprise hardware configuration solutions powered by AI and industry expertise.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/configurator" className="transition hover:text-emerald-400">
                    Hardware Configurator
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="transition hover:text-emerald-400">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="transition hover:text-emerald-400">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="transition hover:text-emerald-400">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-emerald-400">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-emerald-400">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Rain Computers. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

