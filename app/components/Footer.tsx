import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">

      <div className="mx-auto grid max-w-7xl gap-12 px-8 py-16 md:grid-cols-4">

        {/* Brand */}
        <div>

          <h2 className="text-3xl font-extrabold text-yellow-500">
            GS Academy
          </h2>

          <p className="mt-5 leading-8 text-slate-300">
            Empowering students through personalised online learning,
            expert tutoring and academic excellence.
          </p>

        </div>

        {/* Quick Links */}
        <div>

          <h3 className="text-xl font-bold">
            Quick Links
          </h3>

          <ul className="mt-5 space-y-3 text-slate-300">

            <li>
              <Link href="/" className="hover:text-yellow-400">
                Home
              </Link>
            </li>

            <li>
              <Link href="/about" className="hover:text-yellow-400">
                About
              </Link>
            </li>

            <li>
              <Link href="/subjects" className="hover:text-yellow-400">
                Subjects
              </Link>
            </li>

            <li>
              <Link href="/pricing" className="hover:text-yellow-400">
                Pricing
              </Link>
            </li>

            <li>
              <Link href="/contact" className="hover:text-yellow-400">
                Contact
              </Link>
            </li>

          </ul>

        </div>

        {/* Subjects */}
        <div>

          <h3 className="text-xl font-bold">
            Subjects
          </h3>

          <ul className="mt-5 space-y-3 text-slate-300">

            <li>Mathematics</li>

            <li>English Language</li>

            <li>Physics</li>

            <li>Chemistry</li>

            <li>Biology</li>

            <li>Other Subjects</li>

          </ul>

        </div>

        {/* Contact */}
        <div>

          <h3 className="text-xl font-bold">
            Contact
          </h3>

          <div className="mt-5 space-y-3 text-slate-300">

            <p>📧 gsacademyadmin@gmail.com</p>

            <p>📱 +234 706 458 6878</p>

            <p>🌍 Online Lessons Worldwide</p>

          </div>

          <h3 className="mt-8 text-xl font-bold">
            Follow Us
          </h3>

          <div className="mt-5 space-y-3">

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

      <div className="border-t border-slate-700">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-8 py-6 text-sm text-slate-400 md:flex-row">

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

    </footer>
  );
}