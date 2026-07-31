"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";

// ...all your existing imports...

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // KEEP THE REST OF YOUR EXISTING CODE EXACTLY THE SAME
}