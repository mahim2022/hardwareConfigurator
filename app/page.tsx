import RequirementForm from "@/components/RequirementForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 lg:py-24">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Hardware Configurator
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
            Requirement-driven PC, laptop & server builds for bulk procurement teams
          </h1>
          <p className="text-base text-slate-300 md:text-lg">
            Feed the rules engine with structured intent, then let OpenRouter-backed reasoning
            explain the recommendation. Built for sourcing teams, not retail shoppers.
          </p>
        </header>

        <RequirementForm />
      </div>
    </div>
  );
}
