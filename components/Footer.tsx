import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-8 py-12 md:grid-cols-3">

        {/* Brand */}
        <div>
          <h3 className="text-2xl font-bold">GS Academy</h3>

          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">
            Helping students build confidence and achieve academic excellence
            through quality online tutoring.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold">Quick Links</h4>

          <ul className="mt-4 space-y-2 text-slate-300">
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
              <Link href="/book" className="hover:text-yellow-400">
                Book Free Week
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-semibold">Contact</h4>

          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p>gsacademyadmin@gmail.com</p>
            <p>+234 706 458 6878</p>
          </div>

          <div className="mt-6 flex gap-5">
            <a
              href="https://facebook.com/gsacademyhub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400"
            >
              Facebook
            </a>

            <a
              href="https://instagram.com/gsacademyhub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400"
            >
              Instagram
            </a>

            <a
              href="https://linkedin.com/company/gsacademyhub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-8 py-5 text-sm text-slate-400 md:flex-row">
          <p>© {new Date().getFullYear()} GS Academy. All rights reserved.</p>
          <p>Grooming Scholars.</p>
        </div>
      </div>
    </footer>
  );
}