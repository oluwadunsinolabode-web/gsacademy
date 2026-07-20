import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-8 py-16">

        <div className="grid gap-12 md:grid-cols-4">

          {/* Logo & About */}
          <div>

            <Image
              src="/gs_website_logo.png"
              alt="GS Academy"
              width={220}
              height={60}
              className="mb-6"
            />

            <p className="leading-7 text-slate-300">
              GS Academy provides high-quality one-to-one online tutoring in
              Mathematics, Science, English and other academic subjects,
              helping students achieve academic excellence worldwide.
            </p>

          </div>

          {/* Quick Links */}
          <div>

            <h3 className="mb-5 text-xl font-bold">
              Quick Links
            </h3>

            <div className="space-y-3">

              <Link href="/" className="block text-slate-300 hover:text-yellow-400">
                Home
              </Link>

              <Link href="/about" className="block text-slate-300 hover:text-yellow-400">
                About
              </Link>

              <Link href="/subjects" className="block text-slate-300 hover:text-yellow-400">
                Subjects
              </Link>

              <Link href="/pricing" className="block text-slate-300 hover:text-yellow-400">
                Pricing
              </Link>

              <Link href="/contact" className="block text-slate-300 hover:text-yellow-400">
                Contact
              </Link>

              <Link href="/book" className="block text-slate-300 hover:text-yellow-400">
                Book Now
              </Link>

            </div>

          </div>

          {/* Subjects */}
          <div>

            <h3 className="mb-5 text-xl font-bold">
              Subjects
            </h3>

            <div className="space-y-3 text-slate-300">

              <p>Mathematics</p>

              <p>English</p>

              <p>Science</p>

              <p>Physics</p>

              <p>Chemistry</p>

              <p>Biology</p>

            </div>

          </div>

          {/* Contact */}
          <div>

            <h3 className="mb-5 text-xl font-bold">
              Contact
            </h3>

            <div className="space-y-4 text-slate-300">

              <p>
                📧 gsacademyadmin@gmail.com
              </p>

              <p>
                📱 +234 706 458 6878
              </p>

              <p>
                🌍 Online Lessons Worldwide
              </p>

            </div>

          </div>

        </div>

        <div className="mt-16 border-t border-slate-700 pt-8 text-center text-sm text-slate-400">

          © {new Date().getFullYear()} GS Academy. All Rights Reserved.

        </div>

      </div>
    </footer>
  );
}