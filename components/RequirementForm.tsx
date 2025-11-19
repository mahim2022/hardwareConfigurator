"use client";

import { useState, type ReactNode } from "react";

import type { BaselineSpec, RequirementsPayload } from "@/lib/rules";
import type { AiSummary } from "@/lib/openrouter";
import { exportToExcel, exportToCSV, type ExportData } from "@/lib/export";

const usageTypes = [
  "office",
  "web",
  "editing",
  "rendering",
  "coding",
  "data analysis",
  "gaming",
  "server",
  "mixed",
] as const;

const quantityOptions = ["1", "5-20", "20-50", "50-200", "200+"] as const;
const formFactors = ["laptop", "desktop", "SFF", "workstation", "ultrabook", "server"] as const;
const priorities = ["cpu", "gpu", "ram", "balanced"] as const;

const softwareOptions = [
  "Microsoft Office",
  "AutoCAD",
  "Adobe Creative Cloud",
  "SolidWorks",
  "DaVinci Resolve",
  "MATLAB",
  "VS Code",
  "PyCharm",
  "Games",
] as const;

type FormState = {
  usageType: (typeof usageTypes)[number];
  budgetRange: string;
  quantity: (typeof quantityOptions)[number];
  formFactor: (typeof formFactors)[number];
  requiredSoftware: string[];
  brandConstraints: string;
  performancePriority: (typeof priorities)[number];
  storageRequirements: string;
  networkingNeeds: string;
  durabilityNeeds: string;
  warrantyPreferences: string;
  powerPreferences: string;
  complianceNotes: string;
  customSoftware: string;
};

type ApiResponse = {
  requirements: RequirementsPayload;
  baselineSpec: BaselineSpec | null;
  aiSummary: AiSummary | null;
  useBaselineFallback?: boolean;
  generatedAt: string;
};

const initialState: FormState = {
  usageType: "office",
  budgetRange: "900-1200",
  quantity: "5-20",
  formFactor: "laptop",
  requiredSoftware: ["Microsoft Office"],
  brandConstraints: "Dell, HP, Lenovo",
  performancePriority: "balanced",
  storageRequirements: "",
  networkingNeeds: "",
  durabilityNeeds: "",
  warrantyPreferences: "3Y onsite NBD",
  powerPreferences: "",
  complianceNotes: "",
  customSoftware: "",
};

const Field = ({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) => (
  <label className="flex flex-col gap-2 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
    <span className="text-sm font-semibold uppercase tracking-wide text-slate-300">
      {label}
    </span>
    {helper && <span className="text-xs text-slate-400">{helper}</span>}
    {children}
  </label>
);

const Badge = ({ label }: { label: string }) => (
  <span className="rounded-full border border-emerald-500/40 px-3 py-1 text-xs uppercase tracking-wide text-emerald-200">
    {label}
  </span>
);

const RequirementForm = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSoftwareToggle = (value: string) => {
    setForm((prev) => {
      const exists = prev.requiredSoftware.includes(value);
      return {
        ...prev,
        requiredSoftware: exists
          ? prev.requiredSoftware.filter((item) => item !== value)
          : [...prev.requiredSoftware, value],
      };
    });
  };

  const handleChange = (field: keyof FormState, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    const payload = {
      ...form,
      requiredSoftware: [
        ...form.requiredSoftware,
        ...form.customSoftware
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ],
    };

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error ?? "Unexpected API error");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Badge label="Input Layer" />
          <h2 className="text-2xl font-semibold text-white">Procurement brief</h2>
          <p className="text-sm text-slate-400">
            Capture the mandatory fields and enrich with optional constraints so the engine can
            shape an optimal match.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Usage Type">
            <select
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.usageType}
              onChange={(event) => handleChange("usageType", event.target.value)}
            >
              {usageTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Budget Range" helper="Total budget per unit or envelope">
            <input
              type="text"
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.budgetRange}
              onChange={(event) => handleChange("budgetRange", event.target.value)}
              placeholder="$1,200 - $1,700"
            />
          </Field>

          <Field label="Quantity">
            <select
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.quantity}
              onChange={(event) => handleChange("quantity", event.target.value)}
            >
              {quantityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Form Factor">
            <select
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.formFactor}
              onChange={(event) => handleChange("formFactor", event.target.value)}
            >
              {formFactors.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Performance Priority">
            <select
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.performancePriority}
              onChange={(event) => handleChange("performancePriority", event.target.value)}
            >
              {priorities.map((option) => (
                <option key={option} value={option}>
                  {option.toUpperCase()}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Brand Constraints" helper="Vendors to prefer or avoid">
            <input
              type="text"
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.brandConstraints}
              onChange={(event) => handleChange("brandConstraints", event.target.value)}
              placeholder="HP only, avoid ASUS"
            />
          </Field>
        </div>

        <Field label="Required Software" helper="Toggle all that apply">
          <div className="grid gap-2 md:grid-cols-2">
            {softwareOptions.map((software) => (
              <label
                key={software}
                className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/40 p-3 text-sm text-slate-200"
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-500 bg-transparent"
                  checked={form.requiredSoftware.includes(software)}
                  onChange={() => handleSoftwareToggle(software)}
                />
                {software}
              </label>
            ))}
          </div>
          <input
            type="text"
            className="mt-3 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
            placeholder="Comma-separated custom tools"
            value={form.customSoftware}
            onChange={(event) => handleChange("customSoftware", event.target.value)}
          />
        </Field>

        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Storage Requirements">
            <textarea
              className="min-h-[88px] rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.storageRequirements}
              onChange={(event) => handleChange("storageRequirements", event.target.value)}
              placeholder="1 TB NVMe, 4 TB NAS"
            />
          </Field>

          <Field label="Networking / I/O Needs">
            <textarea
              className="min-h-[88px] rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.networkingNeeds}
              onChange={(event) => handleChange("networkingNeeds", event.target.value)}
              placeholder="Dual 2.5GbE, HDMI 2.1, Thunderbolt 4"
            />
          </Field>

          <Field label="Durability & Mobility">
            <textarea
              className="min-h-[88px] rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.durabilityNeeds}
              onChange={(event) => handleChange("durabilityNeeds", event.target.value)}
              placeholder="Rugged MIL-STD, <1.2kg, 12h battery"
            />
          </Field>

          <Field label="Warranty & Support">
            <textarea
              className="min-h-[88px] rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.warrantyPreferences}
              onChange={(event) => handleChange("warrantyPreferences", event.target.value)}
            />
          </Field>

          <Field label="Power Efficiency">
            <textarea
              className="min-h-[88px] rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.powerPreferences}
              onChange={(event) => handleChange("powerPreferences", event.target.value)}
              placeholder="80Plus Platinum PSU, EPEAT Gold"
            />
          </Field>

          <Field label="Compliance / Policy Notes">
            <textarea
              className="min-h-[88px] rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.complianceNotes}
              onChange={(event) => handleChange("complianceNotes", event.target.value)}
              placeholder="TPM 2.0, TAA compliant"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-emerald-500/90 px-6 py-3 text-base font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Generating..." : "Generate configuration"}
        </button>

        {error && (
          <p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </p>
        )}
      </form>

      <section className="space-y-4 rounded-3xl border border-slate-800/60 bg-slate-950/40 p-6">
        <div className="space-y-3">
          <Badge label="Output Layer" />
          <h3 className="text-xl font-semibold text-white">Configuration intelligence</h3>
          <p className="text-sm text-slate-400">
            Rule-based baseline plus OpenRouter AI reasoning when the API key is present.
          </p>
        </div>

        {!result && !isSubmitting && (
          <div className="rounded-2xl border border-dashed border-slate-700/60 p-6 text-sm text-slate-400">
            Run the generator to see the baseline spec, AI summary, price envelope, and scalable
            deployment notes.
          </div>
        )}

        {isSubmitting && (
          <div className="animate-pulse rounded-2xl border border-slate-700/60 p-6">
            <p className="text-sm text-slate-300">Crunching requirements...</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Only show baseline spec if AI failed and we're using fallback */}
            {result.useBaselineFallback && result.baselineSpec && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-200">
                  Baseline spec (AI unavailable)
                </h4>
                <ul className="mt-3 space-y-1 text-sm text-slate-200">
                  <li>
                    <strong>CPU:</strong> {result.baselineSpec.cpu}
                  </li>
                  <li>
                    <strong>GPU:</strong> {result.baselineSpec.gpu}
                  </li>
                  <li>
                    <strong>RAM:</strong> {result.baselineSpec.ram}
                  </li>
                  <li>
                    <strong>Storage:</strong> {result.baselineSpec.storage}
                  </li>
                  <li>
                    <strong>Networking:</strong> {result.baselineSpec.networking}
                  </li>
                  {result.baselineSpec.display && (
                    <li>
                      <strong>Display:</strong> {result.baselineSpec.display}
                    </li>
                  )}
                  <li>
                    <strong>Estimated unit price:</strong> {result.baselineSpec.estimatedUnitPrice}
                  </li>
                </ul>
                {result.baselineSpec.accessories && result.baselineSpec.accessories.length > 0 && (
                  <div className="mt-3 text-xs text-slate-400">
                    Accessories: {result.baselineSpec.accessories.join(", ")}
                  </div>
                )}
                <div className="mt-4 text-xs text-slate-400">
                  Notes: {result.baselineSpec.notes.join(" • ")}
                </div>
              </div>
            )}

            {result.aiSummary ? (
              <div className="space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                  AI-Generated Configuration
                </h4>
                <div className="space-y-2 text-sm text-slate-100">
                  <p>
                    <strong>Best fit:</strong> {result.aiSummary.bestFitConfiguration}
                  </p>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <p className="text-base font-semibold text-emerald-200">
                      <strong>Unit Price:</strong> {result.aiSummary.unitPrice}
                    </p>
                    <p className="text-lg font-bold text-emerald-100">
                      <strong>Total Price (All Units):</strong> {result.aiSummary.totalPrice}
                    </p>
                  </div>
                  <p>
                    <strong>Detailed Price Breakdown:</strong> {result.aiSummary.priceEstimate}
                  </p>
                  <p>
                    <strong>Reasoning:</strong> {result.aiSummary.reasoning}
                  </p>
                  <p>
                    <strong>Bulk scaling:</strong> {result.aiSummary.bulkScaling}
                  </p>
                </div>
                {/* Alternatives removed: no longer requested from OpenRouter */}
              </div>
            ) : !result.useBaselineFallback ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-amber-100">
                AI summary unavailable. Add an `OPENROUTER_API_KEY` to enable the reasoning layer.
              </div>
            ) : null}

            {result && (
              <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Export Quotation
                </h4>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={async () => {
                      const exportData: ExportData = {
                        requirements: result.requirements,
                        baselineSpec: result.baselineSpec || undefined,
                        aiSummary: result.aiSummary,
                        generatedAt: result.generatedAt,
                      };
                      await exportToExcel(exportData);
                    }}
                    className="flex-1 rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    📊 Download Excel
                  </button>
                  <button
                    onClick={() => {
                      const exportData: ExportData = {
                        requirements: result.requirements,
                        baselineSpec: result.baselineSpec || undefined,
                        aiSummary: result.aiSummary,
                        generatedAt: result.generatedAt,
                      };
                      exportToCSV(exportData);
                    }}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-500/50 hover:bg-slate-800"
                  >
                    📄 Download CSV
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500">Generated at {result.generatedAt}</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default RequirementForm;

