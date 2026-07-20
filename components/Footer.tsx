import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white">

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-8 py-10 md:flex-row">

        {/* Brand */}

        <div>

          <h3 className="text-2xl font-bold text-slate-900">
            GS Academy
          </h3>

          <p className="mt-2 text-slate-600">
            Grooming Scholars.
          </p>

        </div>

        {/* Navigation */}

        <div className="flex flex-wrap justify-center gap-8 text-slate-700">

          <Link href="/about" className="hover:text-yellow-600">
            About
          </Link>

          <Link href="/subjects" className="hover:text-yellow-600">
            Subjects
          </Link>

          <Link href="/pricing" className="hover:text-yellow-600">
            Pricing
          </Link>

          <Link href="/contact" className="hover:text-yellow-600">
            Contact
          </Link>

        </div>

        {/* Contact */}

        <div className="text-center md:text-right">

          <p className="text-slate-700">
            gsacademyadmin@gmail.com
          </p>

          <p className="mt-2 text-slate-700">
            +234 706 458 6878
          </p>

        </div>

      </div>

      <div className="border-t py-5 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} GS Academy. All rights reserved.
      </div>

    </footer>
  );
}