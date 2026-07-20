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

              <Link href="/book" className="block text-slate-300 hover:text-yellow-400">
                Book a Session
              </Link>

              <Link href="/contact" className="block text-slate-300 hover:text-yellow-400">
                Contact
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

              <p>English Language</p>

              <p>Physics</p>

              <p>Chemistry</p>

              <p>Biology</p>

              <p>Other Subjects</p>

            </div>

          </div>

          {/* Contact */}
          <div>

            <h3 className="mb-5 text-xl font-bold">
              Contact
            </h3>

            <div className="space-y-4 text-slate-300">

              <p>📧 gsacademyadmin@gmail.com</p>

              <p>📱 +234 706 458 6878</p>

              <p>🌍 Online Lessons Worldwide</p>

            </div>

            <h3 className="mt-8 mb-5 text-xl font-bold">
              Follow Us
            </h3>

            <div className="space-y-3">

              <a
                href="https://facebook.com/gsacademyhub"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-slate-300 hover:text-yellow-400"
              >
                Facebook
              </a>

              <a
                href="https://instagram.com/gsacademyhub"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-slate-300 hover:text-yellow-400"
              >
                Instagram
              </a>

              <a
                href="https://linkedin.com/company/gsacademyhub"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-slate-300 hover:text-yellow-400"
              >
                LinkedIn
              </a>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="mt-16 border-t border-slate-700 pt-8">

          <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-400 md:flex-row">

            <p>
              © {new Date().getFullYear()} GS Academy. All Rights Reserved.
            </p>

            <div className="flex gap-6">

              <Link
                href="/privacy"
                className="hover:text-yellow-400"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="hover:text-yellow-400"
              >
                Terms & Conditions
              </Link>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}