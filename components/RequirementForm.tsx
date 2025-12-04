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

const storageOptions = [
  "1 TB NVMe",
  "512 GB NVMe",
  "2 TB NVMe",
  "4 TB HDD",
  "Custom",
] as const;

const networkingOptions = [
  "1GbE",
  "2.5GbE",
  "10GbE",
  "Wi-Fi 6",
  "Thunderbolt 4",
  "Custom",
] as const;

const durabilityOptions = [
  "Standard",
  "Rugged (MIL-STD)",
  "Lightweight / Portable",
  "Semi-rugged",
  "Custom",
] as const;

const warrantyOptions = [
  "1Y standard",
  "3Y onsite NBD",
  "5Y onsite",
  "Extended (quote)",
] as const;

const powerOptions = [
  "Standard PSU",
  "80Plus Bronze",
  "80Plus Silver",
  "80Plus Gold",
  "80Plus Platinum",
] as const;

const complianceOptions = ["TPM 2.0", "TAA", "EPEAT", "None", "Other"] as const;

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
  includeUps: boolean;
  includePrinterScanner: boolean;
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
  storageRequirements: "1 TB NVMe",
  networkingNeeds: "1GbE",
  durabilityNeeds: "Standard",
  warrantyPreferences: "1Y standard",
  powerPreferences: "80Plus Platinum",
  complianceNotes: "TPM 2.0",
  customSoftware: "",
  includeUps: false,
  includePrinterScanner: false,
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
  const [pcImage, setPcImage] = useState<{ url: string; title: string; source: string } | null>(null);
  const [cpuImage, setCpuImage] = useState<{ url: string; title: string; source: string } | null>(null);
  const [gpuImage, setGpuImage] = useState<{ url: string; title: string; source: string } | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoadingCpuImage, setIsLoadingCpuImage] = useState(false);
  const [isLoadingGpuImage, setIsLoadingGpuImage] = useState(false);

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

  const handleChange = (field: keyof FormState, value: string | string[] | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setPcImage(null);
    setCpuImage(null);
    setGpuImage(null);

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

      // Fetch images for PC, CPU, and GPU if available
      // PC Image
      if (data.aiSummary?.pcName) {
        setIsLoadingImage(true);
        try {
          const imageResponse = await fetch(
            `/api/search-image?q=${encodeURIComponent(data.aiSummary.pcName)}`
          );
          const imageData = await imageResponse.json();
          if (imageData.imageUrl) {
            setPcImage({
              url: imageData.imageUrl,
              title: imageData.title || data.aiSummary.pcName,
              source: imageData.source || "Search",
            });
          } else {
            setPcImage(null);
          }
        } catch (imgError) {
          console.error("Failed to fetch PC image:", imgError);
          setPcImage(null);
        } finally {
          setIsLoadingImage(false);
        }
      } else {
        setPcImage(null);
      }

      // CPU Image
      if (data.aiSummary?.cpu) {
        // console.log("Fetching CPU image for:", data.aiSummary.cpu);
        setIsLoadingCpuImage(true);
        try {
          const cpuQuery = `${data.aiSummary.cpu} processor`;
          const cpuImageResponse = await fetch(
            `/api/search-image?q=${encodeURIComponent(cpuQuery)}`
          );
          // const cpuImageResponse = await fetch(
          //   `/api/search-image?q=${encodeURIComponent(data.aiSummary.cpu)}`
          // );
          const cpuImageData = await cpuImageResponse.json();
          if (cpuImageData.imageUrl) {
            setCpuImage({
              url: cpuImageData.imageUrl,
              title: cpuImageData.title || data.aiSummary.cpu,
              source: cpuImageData.source || "Search",
            });
          } else {
            setCpuImage(null);
          }
        } catch (imgError) {
          console.error("Failed to fetch CPU image:", imgError);
          setCpuImage(null);
        } finally {
          setIsLoadingCpuImage(false);
        }
      } else {
        setCpuImage(null);
      }

      // GPU Image
      if (data.aiSummary?.gpu) {
        // console.log("Fetching GPU image for:", data.aiSummary.gpu);
        setIsLoadingGpuImage(true);
        try {
          const gpuImageResponse = await fetch(
            `/api/search-image?q=${encodeURIComponent(data.aiSummary.gpu)}`
          );
          const gpuImageData = await gpuImageResponse.json();
          if (gpuImageData.imageUrl) {
            setGpuImage({
              url: gpuImageData.imageUrl,
              title: gpuImageData.title || data.aiSummary.gpu,
              source: gpuImageData.source || "Search",
            });
          } else {
            setGpuImage(null);
          }
        } catch (imgError) {
          console.error("Failed to fetch GPU image:", imgError);
          setGpuImage(null);
        } finally {
          setIsLoadingGpuImage(false);
        }
      } else {
        setGpuImage(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate configuration");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="grid gap-8 lg:grid-cols-1">
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
            <select
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.storageRequirements}
              onChange={(event) => handleChange("storageRequirements", event.target.value)}
            >
              <option value="">Select storage</option>
              {storageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Networking / I/O Needs">
            <select
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.networkingNeeds}
              onChange={(event) => handleChange("networkingNeeds", event.target.value)}
            >
              <option value="">Select networking</option>
              {networkingOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Durability & Mobility">
            <select
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.durabilityNeeds}
              onChange={(event) => handleChange("durabilityNeeds", event.target.value)}
            >
              <option value="">Select durability</option>
              {durabilityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Warranty & Support">
            <select
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.warrantyPreferences}
              onChange={(event) => handleChange("warrantyPreferences", event.target.value)}
            >
              <option value="">Select warranty</option>
              {warrantyOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Power Efficiency">
            <select
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
              value={form.powerPreferences}
              onChange={(event) => handleChange("powerPreferences", event.target.value)}
            >
              <option value="">Select power tier</option>
              {powerOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Compliance / Policy Notes">
            <div className="flex flex-col gap-2">
              {complianceOptions.map((opt) => (
                <label key={opt} className="inline-flex items-center gap-3 text-sm text-slate-200">
                  <input
                    type="radio"
                    name="compliance"
                    value={opt}
                    checked={form.complianceNotes === opt}
                    onChange={() => handleChange("complianceNotes", opt)}
                    className="rounded border-slate-600 bg-transparent"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Peripherals & Accessories">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/40 p-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={form.includeUps}
                onChange={() => handleChange("includeUps", !form.includeUps)}
                className="size-4 rounded border-slate-500 bg-transparent"
              />
              UPS (Uninterruptible Power Supply)
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/40 p-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={form.includePrinterScanner}
                onChange={() => handleChange("includePrinterScanner", !form.includePrinterScanner)}
                className="size-4 rounded border-slate-500 bg-transparent"
              />
              Printer & Scanner
            </label>
          </div>
        </Field>

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
            Run the generator to see the baseline spec, summary, price envelope, and scalable
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
            {/* PC Name - Prominent Display with Large Images */}
            {result.aiSummary?.pcName && (
              <div className="rounded-3xl border-2 border-emerald-500/60 bg-linear-to-r from-emerald-500/15 to-cyan-500/10 p-8 shadow-lg shadow-emerald-500/20">
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                  {/* Images Section */}
                  <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                    {/* PC Image */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold text-emerald-300 mb-2">System</span>
                      {isLoadingImage ? (
                        <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-emerald-500/30 bg-slate-900/50">
                          <div className="h-12 w-12 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500"></div>
                        </div>
                      ) : pcImage?.url ? (
                        <div className="group relative">
                          <img
                            src={pcImage.url}
                            alt={pcImage.title}
                            className="h-64 w-64 rounded-2xl border-2 border-emerald-500/40 bg-white object-contain p-4 shadow-xl transition-transform group-hover:scale-105"
                          />
                          {/* <p className="mt-2 text-center text-xs text-emerald-300/70">{pcImage.source}</p> */}
                        </div>
                      ) : (
                        <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-dashed border-emerald-500/30 bg-slate-900/30">
                          <p className="text-center text-xs text-slate-400">No image<br />available</p>
                        </div>
                      )}
                    </div>
                    {/* CPU Image */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold text-cyan-300 mb-2">CPU</span>
                      {isLoadingCpuImage ? (
                        <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-cyan-500/30 bg-slate-900/50">
                          <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-500"></div>
                        </div>
                      ) : cpuImage?.url ? (
                        <div className="group relative">
                          <img
                            src={cpuImage.url}
                            alt={cpuImage.title}
                            className="h-64 w-64 rounded-2xl border-2 border-cyan-500/40 bg-white object-contain p-4 shadow-xl transition-transform group-hover:scale-105"
                          />
                          {/* <p className="mt-2 text-center text-xs text-cyan-300/70">{cpuImage.source}</p> */}
                        </div>
                      ) : (
                        <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-dashed border-cyan-500/30 bg-slate-900/30">
                          <p className="text-center text-xs text-slate-400">No image<br />available</p>
                        </div>
                      )}
                    </div>
                    {/* GPU Image */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold text-indigo-300 mb-2">GPU</span>
                      {isLoadingGpuImage ? (
                        <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-indigo-500/30 bg-slate-900/50">
                          <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500"></div>
                        </div>
                      ) : gpuImage?.url ? (
                        <div className="group relative">
                          <img
                            src={gpuImage.url}
                            alt={gpuImage.title}
                            className="h-64 w-64 rounded-2xl border-2 border-indigo-500/40 bg-white object-contain p-4 shadow-xl transition-transform group-hover:scale-105"
                          />
                          {/* <p className="mt-2 text-center text-xs text-indigo-300/70">{gpuImage.source}</p> */}
                        </div>
                      ) : (
                        <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-dashed border-indigo-500/30 bg-slate-900/30">
                          <p className="text-center text-xs text-slate-400">No image<br />available</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* System Name Section */}
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Recommended System</p>
                    <p className="mt-3 text-4xl font-bold text-emerald-100">{result.aiSummary.pcName}</p>
                  </div>
                </div>
              </div>
            )}

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
                  AI enhanced summary
                </h4>

                {/* Configuration Summary Table */}
                <div className="space-y-4">
                  {/* Component Specifications Table */}
                  <div className="overflow-hidden rounded-xl border border-emerald-500/40 bg-slate-900/30">
                    <table className="w-full text-sm">
                      <tbody>
                        {/* Core Components */}
                        <tr className="border-b border-slate-700/40">
                          <td className="px-4 py-3 font-semibold text-slate-300">CPU</td>
                          <td className="px-4 py-3 text-emerald-100">{result.aiSummary.cpu}</td>
                        </tr>
                        {result.aiSummary.cpuCores && (
                          <tr className="border-b border-slate-700/40 bg-slate-900/20 text-xs">
                            <td className="px-4 py-2 text-slate-400">Cores/Threads</td>
                            <td className="px-4 py-2 text-slate-300">{result.aiSummary.cpuCores} / {result.aiSummary.cpuThreads || "—"}</td>
                          </tr>
                        )}
                        {result.aiSummary.cpuCache && (
                          <tr className="border-b border-slate-700/40 bg-slate-900/20 text-xs">
                            <td className="px-4 py-2 text-slate-400">Cache/Frequency</td>
                            <td className="px-4 py-2 text-slate-300">{result.aiSummary.cpuCache} / {result.aiSummary.cpuFrequency || "—"}</td>
                          </tr>
                        )}
                        <tr className="border-b border-slate-700/40 bg-slate-900/20">
                          <td className="px-4 py-3 font-semibold text-slate-300">GPU</td>
                          <td className="px-4 py-3 text-emerald-100">{result.aiSummary.gpu}</td>
                        </tr>
                        <tr className="border-b border-slate-700/40">
                          <td className="px-4 py-3 font-semibold text-slate-300">RAM</td>
                          <td className="px-4 py-3 text-emerald-100">{result.aiSummary.ram}</td>
                        </tr>
                        {result.aiSummary.ramSlots && (
                          <tr className="border-b border-slate-700/40 bg-slate-900/20 text-xs">
                            <td className="px-4 py-2 text-slate-400">RAM Slots/Speed</td>
                            <td className="px-4 py-2 text-slate-300">{result.aiSummary.ramSlots} / {result.aiSummary.ramSpeed || "—"}</td>
                          </tr>
                        )}
                        <tr className="border-b border-slate-700/40 bg-slate-900/20">
                          <td className="px-4 py-3 font-semibold text-slate-300">Storage</td>
                          <td className="px-4 py-3 text-emerald-100">{result.aiSummary.storage}</td>
                        </tr>
                        {result.aiSummary.nvmeSlots && (
                          <tr className="border-b border-slate-700/40 text-xs">
                            <td className="px-4 py-2 text-slate-400">NVMe Slots</td>
                            <td className="px-4 py-2 text-slate-300">{result.aiSummary.nvmeSlots}</td>
                          </tr>
                        )}

                        {/* Power & Battery */}
                        {result.aiSummary.powerSupply && (
                          <tr className="border-b border-slate-700/40 bg-slate-900/20">
                            <td className="px-4 py-3 font-semibold text-slate-300">Power Supply</td>
                            <td className="px-4 py-3 text-slate-300">{result.aiSummary.powerSupply}</td>
                          </tr>
                        )}
                        {result.aiSummary.batteryInfo && (
                          <tr className="border-b border-slate-700/40">
                            <td className="px-4 py-3 font-semibold text-slate-300">Battery</td>
                            <td className="px-4 py-3 text-slate-300">{result.aiSummary.batteryInfo}</td>
                          </tr>
                        )}

                        {/* Display & I/O */}
                        {result.aiSummary.screen && (
                          <tr className="border-b border-slate-700/40 bg-slate-900/20">
                            <td className="px-4 py-3 font-semibold text-slate-300">Display</td>
                            <td className="px-4 py-3 text-slate-300">{result.aiSummary.screen}</td>
                          </tr>
                        )}
                        {result.aiSummary.ioPorts && (
                          <tr className="border-b border-slate-700/40">
                            <td className="px-4 py-3 font-semibold text-slate-300">I/O Ports</td>
                            <td className="px-4 py-3 text-slate-300">{result.aiSummary.ioPorts}</td>
                          </tr>
                        )}
                        {result.aiSummary.webcam && (
                          <tr className="border-b border-slate-700/40 bg-slate-900/20">
                            <td className="px-4 py-3 font-semibold text-slate-300">Webcam</td>
                            <td className="px-4 py-3 text-slate-300">{result.aiSummary.webcam}</td>
                          </tr>
                        )}

                        {/* System Components */}
                        {result.aiSummary.motherboard && (
                          <tr className="border-b border-slate-700/40">
                            <td className="px-4 py-3 font-semibold text-slate-300">Motherboard</td>
                            <td className="px-4 py-3 text-slate-300">{result.aiSummary.motherboard}</td>
                          </tr>
                        )}
                        {result.aiSummary.coolingSystem && (
                          <tr className="border-b border-slate-700/40 bg-slate-900/20">
                            <td className="px-4 py-3 font-semibold text-slate-300">Cooling</td>
                            <td className="px-4 py-3 text-slate-300">{result.aiSummary.coolingSystem}</td>
                          </tr>
                        )}

                        {/* Features */}
                        {result.aiSummary.audioFeatures && (
                          <tr className="border-b border-slate-700/40">
                            <td className="px-4 py-3 font-semibold text-slate-300">Audio</td>
                            <td className="px-4 py-3 text-slate-300">{result.aiSummary.audioFeatures}</td>
                          </tr>
                        )}
                        {result.aiSummary.networkFeatures && (
                          <tr className="border-b border-slate-700/40 bg-slate-900/20">
                            <td className="px-4 py-3 font-semibold text-slate-300">Networking</td>
                            <td className="px-4 py-3 text-slate-300">{result.aiSummary.networkFeatures}</td>
                          </tr>
                        )}

                        {/* Physical Specs */}
                        {result.aiSummary.size && (
                          <tr className="border-b border-slate-700/40">
                            <td className="px-4 py-3 font-semibold text-slate-300">Size</td>
                            <td className="px-4 py-3 text-slate-300">{result.aiSummary.size}</td>
                          </tr>
                        )}
                        {result.aiSummary.weight && (
                          <tr className="border-b border-slate-700/40 bg-slate-900/20">
                            <td className="px-4 py-3 font-semibold text-slate-300">Weight</td>
                            <td className="px-4 py-3 text-slate-300">{result.aiSummary.weight}</td>
                          </tr>
                        )}
                        {result.aiSummary.upgradability && (
                          <tr className="border-b border-slate-700/40">
                            <td className="px-4 py-3 font-semibold text-slate-300">Upgradability</td>
                            <td className="px-4 py-3 text-slate-300">{result.aiSummary.upgradability}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="rounded-xl border-2 border-emerald-500/50 bg-linear-to-r from-emerald-500/10 to-teal-600/5 p-5 shadow-lg shadow-emerald-500/10">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-3">Pricing Breakdown</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Unit Price:</span>
                      <span className="text-xl font-bold text-emerald-100">{result.aiSummary.unitPrice}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm border-t border-emerald-500/20 pt-3">
                      <span className="text-slate-300">Quantity:</span>
                      <span className="font-semibold text-emerald-100">{result.requirements.quantity} units</span>
                    </div>
                    {(() => {
                      const unitPriceStr = result.aiSummary.unitPrice.replace(/[^0-9.]/g, '');
                      const unitPriceNum = parseFloat(unitPriceStr);
                      
                      if (!isNaN(unitPriceNum)) {
                        // Parse quantity range and calculate
                        const qty = result.requirements.quantity;
                        let estimatedQty = 1;
                        
                        if (qty === "1") estimatedQty = 1;
                        else if (qty === "5-20") estimatedQty = 12;
                        else if (qty === "20-50") estimatedQty = 35;
                        else if (qty === "50-200") estimatedQty = 125;
                        else if (qty === "200+") estimatedQty = 250;
                        
                        const totalPrice = unitPriceNum * estimatedQty;
                        
                        return (
                          <div className="flex items-center justify-between text-base border-t-2 border-emerald-500/30 pt-3">
                            <span className="font-semibold text-emerald-200">Estimated Total:</span>
                            <span className="text-2xl font-bold text-emerald-100">
                              ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* Bulk Scaling - Eye Catching */}
                <div className="rounded-xl border-2 border-violet-500/50 bg-linear-to-r from-violet-500/10 to-purple-600/5 p-4 shadow-lg shadow-violet-500/10">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">📈</div>
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-violet-300">Bulk Scaling Strategy</p>
                      <p className="mt-2 text-sm leading-relaxed text-violet-50">{result.aiSummary.bulkScaling}</p>
                    </div>
                  </div>
                </div>

                {/* UPS Recommendation */}
                {result.aiSummary.upsRecommendation && (
                  <div className="rounded-xl border-2 border-cyan-500/50 bg-linear-to-r from-cyan-500/10 to-blue-600/5 p-4 shadow-lg shadow-cyan-500/10">
                    <div className="flex items-start gap-3">
                      <div className="text-xl">🔋</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">UPS Recommendation</p>
                        <p className="mt-2 text-sm leading-relaxed text-cyan-50">{result.aiSummary.upsRecommendation}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Printer & Scanner Recommendation */}
                {result.aiSummary.printerScannerRecommendation && (
                  <div className="rounded-xl border-2 border-indigo-500/50 bg-linear-to-r from-indigo-500/10 to-pink-600/5 p-4 shadow-lg shadow-indigo-500/10">
                    <div className="flex items-start gap-3">
                      <div className="text-xl">🖨️</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Printer & Scanner</p>
                        <p className="mt-2 text-sm leading-relaxed text-indigo-50">{result.aiSummary.printerScannerRecommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Alternatives removed: no longer requested from OpenRouter */}
              </div>
            ) : !result.useBaselineFallback ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-amber-100">
                Real time configuration
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

