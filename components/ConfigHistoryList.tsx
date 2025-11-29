// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

// interface ConfigRecord {
//   id: number;
//   created_at: string;
//   unit_price: string | null;
//   price_estimate: string | null;
//   best_fit_configuration: string | null;
//   used_ai: boolean;
// }

// export default function ConfigHistoryList() {
//   const [configs, setConfigs] = useState<ConfigRecord[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch("/api/configurations")
//       .then(res => res.json())
//       .then(data => {
//         setConfigs(data.configurations || []);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//     //   console.log("Fetched configurations:", configs);
//   }, []);

//   useEffect(() => {
//   console.log("Configs updated:", configs);
// }, [configs]);


  


//   if (loading) return <p className="text-slate-400">Loading history…</p>;

//   if (!configs.length)
//     return (
//       <p className="text-slate-400">
//         No configurations found. Generate one first.
//       </p>
//     );

//   return (
//     <div className="grid gap-6">
//       {configs.map((item) => (
//         <Link
//           href={`/configurations/${item.id}`}
//           key={item.id}
//           className="block rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg shadow-black/10 transition hover:border-emerald-500/40 hover:bg-slate-900/60"
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-lg font-semibold text-white">
//                 Build #{item.id}
//               </h2>
//               <p className="text-sm text-slate-400">
//                 {new Date(item.created_at).toLocaleString()}
//               </p>
//             </div>

//             <span
//               className={`rounded-md px-3 py-1 text-xs font-semibold ${
//                 item.used_ai
//                   ? "bg-emerald-500/20 text-emerald-300"
//                   : "bg-yellow-500/20 text-yellow-300"
//               }`}
//             >
//               {item.used_ai ? "AI Generated" : "Baseline Fallback"}
//             </span>
//           </div>

//           <div className="mt-4 text-sm text-slate-300">
//             <p>
//               <span className="font-medium text-slate-200">Unit Price: </span>
//               {item.unit_price || item.price_estimate || "—"}
//             </p>

//             <p className="mt-2 line-clamp-2 text-slate-400">
//               {item.best_fit_configuration || "No summary available"}
//             </p>
//           </div>
//         </Link>
//       ))}
//     </div>
//   );
// }


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

  useEffect(() => {
    fetch("/api/configurations")
      .then(res => res.json())
      .then(data => {
        setConfigs(data.configurations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
                    item.status === "Completed"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : item.status === "Pending"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : item.status === "Failed"
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {item.status ?? "—"}
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
              <button
                className="text-slate-300 hover:text-rose-400"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
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
