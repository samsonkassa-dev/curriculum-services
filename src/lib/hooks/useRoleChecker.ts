"use client";

import { useState, useEffect } from "react";
import { decodeJWT } from "@/lib/utils";

export function useRoleChecker() {
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeJWT(token);
      setUserRole(decoded?.role || "");
    }
  }, []);

  return { userRole };
}
