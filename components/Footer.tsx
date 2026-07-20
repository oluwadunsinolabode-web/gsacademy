import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-8 py-16 md:grid-cols-4">

        {/* GS Academy */}
        <div>
          <h3 className="text-2xl font-bold">GS Academy</h3>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            Helping students build confidence and achieve academic excellence
            through quality online tutoring.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold">Quick Links</h4>

          <ul className="mt-5 space-y-3 text-slate-300">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/subjects">Subjects</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-lg font-semibold">Support</h4>

          <ul className="mt-5 space-y-3 text-slate-300">
            <li><Link href="/book">Book Free Week</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/login">Student Portal</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-semibold">Contact</h4>

          <div className="mt-5 space-y-3 text-slate-300 text-sm">
            <p>gsacademyadmin@gmail.com</p>
            <p>+234 706 458 6878</p>
          </div>
        </div>

      </div>

      <div className="border-t border-slate-700">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-8 py-6 text-sm text-slate-400 md:flex-row">

          <p>
            © {new Date().getFullYear()} GS Academy. All rights reserved.
          </p>

          <p>GS Academy</p>

        </div>
      </div>
    </footer>
  );
}