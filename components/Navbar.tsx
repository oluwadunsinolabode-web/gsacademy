import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-10 py-5">
      {/* Logo */}
      <Image
        src="/logo.png"
        alt="GS Academy"
        width={240}
        height={65}
        priority
        className="h-auto"
      />

      {/* Navigation */}
      <div className="hidden items-center gap-10 md:flex">
        <a
          href="#"
          className="font-medium text-slate-700 hover:text-yellow-600 transition"
        >
          Home
        </a>

        <a
          href="#"
          className="font-medium text-slate-700 hover:text-yellow-600 transition"
        >
          About
        </a>

        <a
          href="#"
          className="font-medium text-slate-700 hover:text-yellow-600 transition"
        >
          Subjects
        </a>

        <a
          href="#"
          className="font-medium text-slate-700 hover:text-yellow-600 transition"
        >
          Pricing
        </a>

        <a
          href="#"
          className="font-medium text-slate-700 hover:text-yellow-600 transition"
        >
          Contact
        </a>
      </div>

      {/* CTA */}
      <Link
        href="/book"
        className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-slate-900 transition hover:bg-yellow-400"
      >
        Book a Discovery Session
      </Link>
    </nav>
  );
}