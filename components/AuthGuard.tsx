"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (!token) {
        router.replace("/login");
      } else {
        setChecked(true);
      }
    } catch (err) {
      router.replace("/login");
    }
  }, [router]);

  if (!checked) return null;
  return <>{children}</>;
}
