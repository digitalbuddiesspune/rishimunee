"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "./SiteHeader.jsx";

export default function SiteHeaderClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <SiteHeader />;
}

