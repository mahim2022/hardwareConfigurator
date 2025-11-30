"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ConfigRecord {
  id: number;
  createdAt: string;
  unitPrice: string | null;
  priceEstimate: string | null;
  bestFitConfiguration: string | null;
  usedAi: boolean;
  status?: string | null;
}

export default function ConfigHistoryList() {
  const [configs, setConfigs] = useState<ConfigRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ConfigRecord | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetch("/api/configurations")
      .then(res => res.json())
      .then(data => {
        setConfigs(data.configurations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch profile to determine if user is admin
    fetch("/api/auth/profile")
      .then(res => res.json())
      .then(data => {
        const role = data?.user?.user_type ?? null;
        setIsAdmin(role === "admin");
      })
      .catch(() => {});
  }, []);

  if (loading) return <p className="text-slate-400">Loading history…</p>;

  if (!configs.length)
    return (
      <p className="text-slate-400">
        No configurations found. Generate one first.
      </p>
    );
  return (
    <div className="grid gap-6">
      {configs.map((item) => (
        <Link
          href="#"
          onClick={e => {
            e.preventDefault();
            // Open details from cached `configs` (no extra API call)
            setSelected(item);
          }}
          key={item.id}
          className="block rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg shadow-black/10 transition hover:border-emerald-500/40 hover:bg-slate-900/60 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Build #{item.id}
              </h2>
              <p className="text-sm text-slate-400">
                {new Date(item.createdAt).toLocaleString()}
              </p>
              <p className="mt-2">
                <span
                  className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                    item.status === "approved"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : item.status === "rejected"
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : "—"}
                </span>
              </p>
            </div>

            <span
              className={`rounded-md px-3 py-1 text-xs font-semibold ${
                item.usedAi
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-yellow-500/20 text-yellow-300"
              }`}
            >
              {item.usedAi ? "AI Generated" : "Baseline Fallback"}
            </span>
          </div>

          <div className="mt-4 text-sm text-slate-300">
            <p>
              <span className="font-medium text-slate-200">Unit Price: </span>
              {item.unitPrice || item.priceEstimate || "—"}
            </p>

            <p className="mt-2 line-clamp-2 text-slate-400">
              {item.bestFitConfiguration || "No summary available"}
            </p>
          </div>
        </Link>
      ))}

      {/* Modal / drawer for selected config */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-3xl rounded-lg bg-slate-900/95 p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-white">Configuration #{selected.id}</h3>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <select
                    value={selected.status ?? ""}
                    onChange={e => {
                      const newStatus = e.target.value;
                      // Only allow approved/rejected values
                      if (!["approved", "rejected"].includes(newStatus)) return;
                      // update local selected and perform server update
                      (async () => {
                        try {
                          setUpdatingStatus(true);
                          const res = await fetch(`/api/configurations/${selected.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: newStatus }),
                          });
                          const resp = await res.json();
                          if (res.ok) {
                            // update local state and configs list
                            const updated = { ...selected, status: resp.configuration.status } as ConfigRecord;
                            setSelected(updated);
                            setConfigs(prev => prev.map(c => (c.id === updated.id ? { ...c, status: updated.status } : c)));
                          } else {
                            console.error("Failed to update status:", resp);
                          }
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setUpdatingStatus(false);
                        }
                      })();
                    }}
                    className="rounded-md bg-slate-800 text-sm text-slate-200 px-2 py-1"
                  >
                    <option value="">Select status</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                )}

                <button
                  className="text-slate-300 hover:text-rose-400"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>
            </div>

            <p className="mt-1 text-sm text-slate-400">{new Date(selected.createdAt).toLocaleString()}</p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <tbody>
                  <tr className="border-t border-slate-800">
                    <td className="py-2 pr-4 font-medium text-slate-200">Unit Price</td>
                    <td className="py-2 text-slate-300">{selected.unitPrice ?? "—"}</td>
                  </tr>
                  <tr className="border-t border-slate-800">
                    <td className="py-2 pr-4 font-medium text-slate-200">Price Estimate</td>
                    <td className="py-2 text-slate-300">{selected.priceEstimate ?? "—"}</td>
                  </tr>
                  <tr className="border-t border-slate-800 align-top">
                    <td className="py-2 pr-4 font-medium text-slate-200">Summary</td>
                    <td className="py-2 text-slate-300 whitespace-pre-wrap">{selected.bestFitConfiguration ?? "No summary available"}</td>
                  </tr>
                  <tr className="border-t border-slate-800">
                    <td className="py-2 pr-4 font-medium text-slate-200">Generated By</td>
                    <td className="py-2 text-slate-300">{selected.usedAi ? "AI Generated" : "Baseline Fallback"}</td>
                  </tr>
                  <tr className="border-t border-slate-800">
                    <td className="py-2 pr-4 font-medium text-slate-200">Status</td>
                    <td className="py-2 text-slate-300">{selected.status ?? "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
