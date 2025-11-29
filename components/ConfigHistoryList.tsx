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
}

export default function ConfigHistoryList() {
  const [configs, setConfigs] = useState<ConfigRecord[]>([]);
  const [loading, setLoading] = useState(true);

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
          href={`/configurations/${item.id}`}
          key={item.id}
          className="block rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg shadow-black/10 transition hover:border-emerald-500/40 hover:bg-slate-900/60"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Build #{item.id}
              </h2>
              <p className="text-sm text-slate-400">
                {new Date(item.createdAt).toLocaleString()}
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
    </div>
  );
}
