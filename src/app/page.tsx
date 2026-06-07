"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Dialog from "@/components/Dialog";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "success" | "error" | "info";
    onAction?: () => void;
  }>({ open: false, title: "", message: "", variant: "info" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionNumber: admissionNumber.trim() }),
      });
      const data = await res.json();

      if (!data.ok) {
        setDialog({
          open: true,
          title: "Invalid Credentials",
          message:
            "The admission number you entered is not valid. Please check and try again.",
          variant: "error",
        });
        return;
      }

      if (data.already_voted) {
        setDialog({
          open: true,
          title: "Already Voted",
          message: `Hello ${data.name ?? "Student"}, you have already cast your vote. Each student can vote only once.`,
          variant: "error",
        });
        return;
      }

      const next = data.next_step === "aspl" ? "/vote/aspl" : "/vote/spl";
      router.push(next);
    } catch {
      setDialog({
        open: true,
        title: "Error",
        message: "Something went wrong. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="relative flex min-h-screen items-center justify-center bg-slate-950 p-4 overflow-x-hidden animate-page-entry">
      {/* Background Animated Blobs */}
      <div className="absolute top-1/4 left-1/4 h-[35rem] w-[35rem] rounded-full bg-blue-600/10 blur-[130px] animate-float-slow pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[40rem] w-[40rem] rounded-full bg-sky-500/10 blur-[150px] animate-float-medium pointer-events-none"></div>

      {/* Decorative Rotating SVG Rings */}
      <svg className="absolute right-[-10%] top-[-10%] h-[35vw] w-[35vw] animate-spin-slow opacity-[0.06] text-blue-400 pointer-events-none" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 12" fill="none" />
      </svg>
      <svg className="absolute left-[-15%] bottom-[-10%] h-[40vw] w-[40vw] animate-spin-slow opacity-[0.04] text-sky-300 pointer-events-none" style={{ animationDirection: "reverse" }} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.6" strokeDasharray="8 6 4 6" fill="none" />
      </svg>

      <div className="relative w-full max-w-md glass-panel glass-panel-glow rounded-3xl p-6 sm:p-10 shadow-2xl transition-all duration-500 hover:border-blue-500/30">
        {/* Decorative Internal Card SVG Lines */}
        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none rounded-tr-3xl">
          <svg className="absolute top-[-10px] right-[-10px] w-20 h-20 text-blue-500/10" viewBox="0 0 100 100">
            <circle cx="100" cy="0" r="80" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="100" cy="0" r="60" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <div className="mb-8 text-center">
          {/* Logo with rotating rings */}
          <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center">
            {/* Pulsing SVG background outer glow */}
            <div className="absolute inset-0 rounded-full bg-blue-500/5 blur-md animate-pulse-glow"></div>
            
            {/* Spinning ring segment */}
            <svg className="absolute inset-0 h-full w-full animate-spin-slow" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="url(#blue-grad)"
                strokeWidth="1.5"
                strokeDasharray="25 15 10 15"
              />
              <defs>
                <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Logo Inner Circle */}
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-blue-500/20 bg-slate-900/60 p-2 shadow-inner">
              <Image
                src="/LOGO.PNG"
                alt="Rosary School Logo"
                fill
                className="object-contain p-1 transition-transform duration-500 hover:scale-110"
                priority
              />
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400/90 glow-text-blue">
            Rosary Matriculation Hr Sec School
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-gradient-blue">
            Election 2026 -2027
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter your credentials to cast your vote
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="admission"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              Admission Number
            </label>
            <div className="relative">
              {/* Animated Key Icon inside Input */}
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-blue-400/70">
                <svg
                  className="h-5 w-5 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                id="admission"
                type="text"
                inputMode="numeric"
                required
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                placeholder="e.g. 7459"
                className="w-full rounded-2xl border border-blue-900/40 bg-slate-900/60 py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:border-sky-400 focus:bg-slate-900/95 focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all duration-300 text-base"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !admissionNumber.trim()}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 py-3.5 font-bold text-white transition-all duration-300 hover:from-blue-500 hover:to-sky-400 hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Login & Vote</span>
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            Your admission number is your unique identifier.
            <br /> Please do not share it with anyone.
          </p>
        </div>
      </div>

      <Dialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        variant={dialog.variant}
        onClose={() => setDialog((d) => ({ ...d, open: false }))}
        onAction={dialog.onAction}
      />
    </main>

    {/* Admin Button on the bottom right corner with border just like a link */}
    <div className="fixed bottom-6 right-6 z-40">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-xs font-semibold text-slate-400 backdrop-blur-md transition-all duration-300 hover:border-blue-500/35 hover:bg-blue-950/30 hover:text-sky-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-page-entry"
      >
        <span>Admin Portal</span>
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  </>
  );
}

