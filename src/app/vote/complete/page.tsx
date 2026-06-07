"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompletePage() {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    async function check() {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.replace("/");
        return;
      }
      const data = await res.json();
      if (!data.has_voted_spl || !data.has_voted_aspl) {
        router.replace(data.next_step === "aspl" ? "/vote/aspl" : "/vote/spl");
        return;
      }
      setName(data.name ?? "");
    }
    check();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  return (
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

      <div className="relative w-full max-w-lg rounded-3xl glass-panel glass-panel-glow p-10 text-center shadow-2xl backdrop-blur-xl border border-blue-500/20 hover:border-blue-500/30 transition-all duration-500 z-10">
        {/* Glowing checkmark orb */}
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-sky-500/15 blur-md animate-pulse-glow"></div>
          
          {/* Animated decorative ring */}
          <svg className="absolute inset-0 h-full w-full animate-spin-slow" style={{ animationDuration: '30s' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" strokeDasharray="15 10 5 10" />
          </svg>

          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-sky-400/35 bg-slate-900/80 text-sky-400 shadow-inner">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-white sm:text-4xl text-gradient-blue tracking-tight">Thank You!</h1>
        
        <p className="mt-5 text-base text-slate-300 leading-relaxed max-w-md mx-auto">
          {name ? <strong className="text-sky-300 font-semibold">{name}</strong> : "Your"} votes have been successfully
          recorded for both <span className="text-slate-100 font-medium">School Leader</span> and <span className="text-slate-100 font-medium">Assistant School Leader</span>.
        </p>
        
        <p className="mt-3 text-xs text-slate-500 max-w-xs mx-auto">
          Your voting response is secured and updated in the election database.
        </p>
        
        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:from-blue-500 hover:to-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.35)] active:scale-[0.98]"
        >
          Logout Session
        </button>
      </div>
    </main>
  );
}
