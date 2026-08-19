import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GS Academy | Grooming Scholars",
    template: "%s | GS Academy",
  },
  description:
    "GS Academy is an online education platform providing quality tutoring, learning resources, assessments, classwork and homework support for students.",
  keywords: [
    "GS Academy",
    "Grooming Scholars",
    "online education",
    "online tutoring",
    "education platform",
  ],
  openGraph: {
    title: "GS Academy | Grooming Scholars",
    description:
      "Quality education and academic support for students through GS Academy.",
    url: "https://gsacademyhub.com",
    siteName: "GS Academy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}