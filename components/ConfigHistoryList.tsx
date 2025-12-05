"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ConfigRecord {
  id: number;
  createdAt: string;
  unitPrice: string | null;
  bestFitConfiguration: string | null;
  usedAi: boolean;
  status?: string | null;
  userEmail?: string | null;
}

interface ComponentSpec {
  cpu?: string;
  cpuCores?: string;
  cpuThreads?: string;
  cpuCache?: string;
  cpuFrequency?: string;
  gpu?: string;
  ram?: string;
  ramSlots?: string;
  ramSpeed?: string;
  storage?: string;
  nvmeSlots?: string;
  powerSupply?: string;
  batteryInfo?: string;
  screen?: string;
  webcam?: string;
  ioPorts?: string;
  motherboard?: string;
  coolingSystem?: string;
  audioFeatures?: string;
  networkFeatures?: string;
  size?: string;
  weight?: string;
  upgradability?: string;
  model?: string;
}

export default function ConfigHistoryList() {
  const [configs, setConfigs] = useState<ConfigRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ConfigRecord | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
        const userEmail = data?.user?.email ?? null;
        setUserEmail(userEmail);
      })
      .catch(() => {});
  }, []);
  // console.log("User email:", userEmail);
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isAdmin ? item.userEmail : `Build #${item.id}`}
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
              className={`self-start rounded-md px-3 py-1 text-xs font-semibold sm:self-auto ${
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
              {item.unitPrice || "—"}
            </p>

            <p className="mt-2 line-clamp-2 text-slate-400">
              {item.bestFitConfiguration || "No summary available"}
            </p>
          </div>
        </Link>
      ))}

      {/* Modal / drawer for selected config */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-full sm:max-w-4xl h-[90vh] sm:h-auto max-h-[90vh] rounded-t-2xl bg-slate-900/95 shadow-2xl my-0 sm:my-8 flex flex-col sm:rounded-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95">
              <h3 className="text-lg font-semibold text-white">Configuration #{selected.id}</h3>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                  className="text-slate-300 hover:text-rose-400 text-left sm:text-right"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="text-sm text-slate-400 mb-4">{new Date(selected.createdAt).toLocaleString()}</p>

              <div className="space-y-6">
                {/* Parse and display component specs */}
                {selected.bestFitConfiguration && (() => {
                  try {
                    const specs: ComponentSpec = JSON.parse(selected.bestFitConfiguration);
                    
                    return (
                      <div className="space-y-4">
                        {/* Core Components */}
                        {(specs.cpu || specs.cpuCores) && (
                          <div className="rounded-lg border border-slate-700/40 overflow-hidden">
                            <div className="bg-slate-800/40 px-4 py-3">
                              <h4 className="font-semibold text-slate-200">CPU</h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[360px] text-sm">
                                <tbody>
                                  {specs.cpu && (
                                    <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Processor</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.cpu}</td>
                                    </tr>
                                  )}
                                  {specs.cpuCores && (
                                    <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Cores/Threads</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.cpuCores} / {specs.cpuThreads || "—"}</td>
                                    </tr>
                                  )}
                                  {specs.cpuCache && (
                                    <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Cache</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.cpuCache}</td>
                                    </tr>
                                  )}
                                  {specs.cpuFrequency && (
                                    <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Frequency</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.cpuFrequency}</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* GPU */}
                        {specs.gpu && (
                          <div className="rounded-lg border border-slate-700/40 overflow-hidden">
                            <div className="bg-slate-800/40 px-4 py-3">
                              <h4 className="font-semibold text-slate-200">GPU</h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[320px] text-sm">
                                <tbody>
                                  <tr className="hover:bg-slate-800/20">
                                    <td className="px-4 py-2 font-medium text-slate-300">Graphics</td>
                                    <td className="px-4 py-2 text-slate-200">{specs.gpu}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* RAM */}
                        {(specs.ram || specs.ramSlots) && (
                          <div className="rounded-lg border border-slate-700/40 overflow-hidden">
                            <div className="bg-slate-800/40 px-4 py-3">
                              <h4 className="font-semibold text-slate-200">Memory</h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[320px] text-sm">
                                <tbody>
                                  {specs.ram && (
                                    <tr className="hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">RAM</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.ram}</td>
                                    </tr>
                                  )}
                                  {specs.ramSlots && (
                                    <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Slots/Speed</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.ramSlots} / {specs.ramSpeed || "—"}</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Storage */}
                        {(specs.storage || specs.nvmeSlots) && (
                          <div className="rounded-lg border border-slate-700/40 overflow-hidden">
                            <div className="bg-slate-800/40 px-4 py-3">
                              <h4 className="font-semibold text-slate-200">Storage</h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[320px] text-sm">
                                <tbody>
                                  {specs.storage && (
                                    <tr className="hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Primary</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.storage}</td>
                                    </tr>
                                  )}
                                  {specs.nvmeSlots && (
                                    <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">NVMe Slots</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.nvmeSlots}</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Power & Battery */}
                        {(specs.powerSupply || specs.batteryInfo) && (
                          <div className="rounded-lg border border-slate-700/40 overflow-hidden">
                            <div className="bg-slate-800/40 px-4 py-3">
                              <h4 className="font-semibold text-slate-200">Power</h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[320px] text-sm">
                                <tbody>
                                  {specs.powerSupply && (
                                    <tr className="hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Supply</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.powerSupply}</td>
                                    </tr>
                                  )}
                                  {specs.batteryInfo && (
                                    <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Battery</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.batteryInfo}</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Display & I/O */}
                        {(specs.screen || specs.ioPorts || specs.webcam) && (
                          <div className="rounded-lg border border-slate-700/40 overflow-hidden">
                            <div className="bg-slate-800/40 px-4 py-3">
                              <h4 className="font-semibold text-slate-200">Display & I/O</h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[320px] text-sm">
                                <tbody>
                                  {specs.screen && (
                                    <tr className="hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Screen</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.screen}</td>
                                    </tr>
                                  )}
                                  {specs.ioPorts && (
                                    <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Ports</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.ioPorts}</td>
                                    </tr>
                                  )}
                                  {specs.webcam && (
                                    <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Webcam</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.webcam}</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* System Components */}
                        {(specs.motherboard || specs.coolingSystem) && (
                          <div className="rounded-lg border border-slate-700/40 overflow-hidden">
                            <div className="bg-slate-800/40 px-4 py-3">
                              <h4 className="font-semibold text-slate-200">System</h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[320px] text-sm">
                                <tbody>
                                  {specs.motherboard && (
                                    <tr className="hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Motherboard</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.motherboard}</td>
                                    </tr>
                                  )}
                                  {specs.coolingSystem && (
                                    <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Cooling</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.coolingSystem}</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Features */}
                        {(specs.audioFeatures || specs.networkFeatures) && (
                          <div className="rounded-lg border border-slate-700/40 overflow-hidden">
                            <div className="bg-slate-800/40 px-4 py-3">
                              <h4 className="font-semibold text-slate-200">Features</h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[320px] text-sm">
                                <tbody>
                                  {specs.audioFeatures && (
                                    <tr className="hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Audio</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.audioFeatures}</td>
                                    </tr>
                                  )}
                                  {specs.networkFeatures && (
                                    <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Networking</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.networkFeatures}</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Physical Specs */}
                        {(specs.size || specs.weight || specs.upgradability) && (
                          <div className="rounded-lg border border-slate-700/40 overflow-hidden">
                            <div className="bg-slate-800/40 px-4 py-3">
                              <h4 className="font-semibold text-slate-200">Physical</h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[320px] text-sm">
                                <tbody>
                                  {specs.size && (
                                    <tr className="hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Size</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.size}</td>
                                    </tr>
                                  )}
                                  {specs.weight && (
                                    <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Weight</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.weight}</td>
                                    </tr>
                                  )}
                                  {specs.upgradability && (
                                    <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                      <td className="px-4 py-2 font-medium text-slate-300">Upgradability</td>
                                      <td className="px-4 py-2 text-slate-200">{specs.upgradability}</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Device Model */}
                        {specs.model && (
                          <div className="rounded-lg border border-slate-700/40 overflow-hidden">
                            <div className="bg-slate-800/40 px-4 py-3">
                              <h4 className="font-semibold text-slate-200">Device</h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[320px] text-sm">
                                <tbody>
                                  <tr className="hover:bg-slate-800/20">
                                    <td className="px-4 py-2 font-medium text-slate-300">Model</td>
                                    <td className="px-4 py-2 text-slate-200">{specs.model}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Info & Pricing */}
                        <div className="rounded-lg border border-slate-700/40 overflow-hidden">
                          <div className="bg-slate-800/40 px-4 py-3">
                            <h4 className="font-semibold text-slate-200">Pricing & Info</h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[320px] text-sm">
                              <tbody>
                                {selected.unitPrice && (
                                  <tr className="hover:bg-slate-800/20">
                                    <td className="px-4 py-2 font-medium text-slate-300">Unit Price</td>
                                    <td className="px-4 py-2 text-slate-200">{selected.unitPrice}</td>
                                  </tr>
                                )}
                                <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                  <td className="px-4 py-2 font-medium text-slate-300">Generated By</td>
                                  <td className="px-4 py-2 text-slate-200">{selected.usedAi ? "AI Generated" : "Baseline Fallback"}</td>
                                </tr>
                                {selected.status && (
                                  <tr className="border-t border-slate-700/40 hover:bg-slate-800/20">
                                    <td className="px-4 py-2 font-medium text-slate-300">Status</td>
                                    <td className="px-4 py-2 text-slate-200">{selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  } catch (e) {
                    return <p className="text-slate-400 text-sm">Unable to parse configuration data</p>;
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
