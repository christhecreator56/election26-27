import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Rosary School Election 2026 -2027",
  description: "School Leader and Assistant School Leader Election Voting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="antialiased relative min-h-screen pt-16 bg-slate-950 text-slate-100">
        {/* Global Header Bar */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.04] bg-slate-950/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-blue-500/20 bg-slate-900/60">
              <Image
                src="/LOGO.PNG"
                alt="Rosary School Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <span className="text-[11px] sm:text-sm font-bold uppercase tracking-wider text-slate-200">
              Rosary Matriculation Hr Sec School
            </span>
          </div>
          <div>
            <span className="text-[9px] sm:text-xs font-semibold tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 uppercase">
              Election 2026-2027
            </span>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
