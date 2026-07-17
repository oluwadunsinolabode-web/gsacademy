"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/gs_website_logo.png"
            alt="GS Academy"
            width={280}
            height={72}
            priority
            className="h-auto w-auto"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-8 md:flex">

          <Link
            href="/"
            className="font-medium text-slate-700 hover:text-yellow-600 transition"
          >
            Home
          </Link>

          <Link
            href="/about"
            className="font-medium text-slate-700 hover:text-yellow-600 transition"
          >
            About
          </Link>

          <Link
            href="/subjects"
            className="font-medium text-slate-700 hover:text-yellow-600 transition"
          >
            Subjects
          </Link>

          <Link
            href="/pricing"
            className="font-medium text-slate-700 hover:text-yellow-600 transition"
          >
            Pricing
          </Link>

          <Link
            href="/contact"
            className="font-medium text-slate-700 hover:text-yellow-600 transition"
          >
            Contact
          </Link>

          <Link
            href="/book"
            className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-slate-900 transition hover:bg-yellow-400"
          >
            Book Now
          </Link>

        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-12 w-12 items-center justify-center rounded-lg md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-slate-800"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="flex flex-col px-6 py-4">

            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="py-3 font-medium text-slate-700"
            >
              Home
            </Link>

            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="py-3 font-medium text-slate-700"
            >
              About
            </Link>

            <Link
              href="/subjects"
              onClick={() => setMenuOpen(false)}
              className="py-3 font-medium text-slate-700"
            >
              Subjects
            </Link>

            <Link
              href="/pricing"
              onClick={() => setMenuOpen(false)}
              className="py-3 font-medium text-slate-700"
            >
              Pricing
            </Link>

            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="py-3 font-medium text-slate-700"
            >
              Contact
            </Link>

            <Link
              href="/book"
              onClick={() => setMenuOpen(false)}
              className="mt-4 rounded-xl bg-yellow-500 py-3 text-center font-semibold text-slate-900 transition hover:bg-yellow-400"
            >
              Book Now
            </Link>

          </div>
        </div>
      )}
    </nav>
  );
}