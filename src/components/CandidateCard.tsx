"use client";

import type { Candidate } from "@/lib/types";
import ProfileCard from "./ProfileCard";

type CandidateCardProps = {
  candidate: Candidate;
  onVote: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
};

export default function CandidateCard({
  candidate,
  onVote,
  disabled,
  loading,
}: CandidateCardProps) {
  const isSpl = candidate.role === "spl";
  const roleTitle = isSpl ? "School Pupil Leader Candidate" : "Asst. School Pupil Leader Candidate";
  const roleHandle = isSpl ? "spl_leader" : "aspl_leader";

  // Use cyan/blue glow for SPL, purple/indigo glow for ASPL for rich aesthetics!
  const glowColor = isSpl ? "rgba(56, 189, 248, 0.6)" : "rgba(168, 85, 247, 0.6)";

  return (
    <>
      {/* Desktop Card Layout (Visible only on screens >= sm) */}
      <div className="hidden sm:flex flex-col items-center w-full gap-5">
        <ProfileCard
          className="w-full"
          avatarUrl={candidate.image_url}
          name={candidate.name}
          title={roleTitle}
          handle={roleHandle}
          status={loading ? "Registering vote..." : "Ready to vote"}
          disabled={disabled || loading}
          behindGlowEnabled={true}
          behindGlowColor={glowColor}
          behindGlowSize="35%"
          innerGradient="linear-gradient(145deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.8) 100%)"
          enableTilt={false}
          enableMobileTilt={false}
          showUserInfo={true}
          showContactButton={false}
        />
        <button
          onClick={() => {
            if (!disabled && !loading) {
              onVote(candidate.id);
            }
          }}
          disabled={disabled || loading}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wider transition-all duration-300 transform active:scale-[0.98] shadow-lg border cursor-pointer select-none
            ${
              loading
                ? "bg-slate-800 text-sky-400 border-slate-700/50 cursor-not-allowed"
                : disabled
                ? "bg-slate-900/60 text-slate-600 border-slate-800/80 opacity-40 cursor-not-allowed shadow-none"
                : isSpl
                ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white border-sky-400/40 hover:border-sky-300 shadow-blue-500/10 hover:shadow-sky-500/30 hover:-translate-y-0.5"
                : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white border-purple-400/40 hover:border-purple-300 shadow-purple-500/10 hover:shadow-purple-500/30 hover:-translate-y-0.5"
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-sky-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting Vote...
            </span>
          ) : (
            "Vote Now"
          )}
        </button>
      </div>

      {/* Mobile Card Layout (Visible only on screens < sm) */}
      <div className="block sm:hidden w-full">
        <div className={`relative overflow-hidden rounded-3xl glass-panel p-4 flex items-center gap-4 transition-all duration-300 border
          ${disabled ? 'opacity-50 border-white/5 bg-slate-950/20' : isSpl ? 'border-sky-500/25 hover:border-sky-500/40 bg-slate-900/70 shadow-lg shadow-sky-950/10' : 'border-purple-500/25 hover:border-purple-500/40 bg-slate-900/70 shadow-lg shadow-purple-950/10'}`}>
          
          {/* Subtle colored glow inside card background */}
          <div className={`absolute -right-8 -bottom-8 h-20 w-20 rounded-full blur-2xl opacity-15 pointer-events-none ${isSpl ? 'bg-sky-500' : 'bg-purple-500'}`} />

          {/* Candidate Image */}
          <div className={`relative h-20 w-20 shrink-0 rounded-2xl border overflow-hidden shadow-inner bg-slate-950 ${isSpl ? 'border-sky-500/30' : 'border-purple-500/30'}`}>
            <img
              src={candidate.image_url}
              alt={candidate.name}
              className="h-full w-full object-cover"
              onError={e => {
                const t = e.target as HTMLImageElement;
                t.style.display = 'none';
              }}
            />
          </div>

          {/* Details & Action Button */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5 gap-3">
            <div>
              <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest ${isSpl ? 'bg-sky-500/10 text-sky-400' : 'bg-purple-500/10 text-purple-400'}`}>
                Candidate
              </span>
              <h3 className="text-base font-extrabold text-white truncate mt-1 leading-tight">{candidate.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5 tracking-wider uppercase">{isSpl ? "School Leader" : "Asst. School Leader"}</p>
            </div>
            
            <button
              onClick={() => {
                if (!disabled && !loading) {
                  onVote(candidate.id);
                }
              }}
              disabled={disabled || loading}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider transition-all duration-300 transform active:scale-[0.98] cursor-pointer select-none flex items-center justify-center gap-2 border
                ${
                  loading
                    ? "bg-slate-800 text-sky-400 border-slate-700/50 cursor-not-allowed"
                    : disabled
                    ? "bg-slate-900/60 text-slate-600 border-slate-800/80 opacity-40 cursor-not-allowed shadow-none"
                    : isSpl
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white border-sky-400/40 shadow-sky-500/10"
                    : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white border-purple-400/40 shadow-purple-500/10"
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-sky-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                "Vote Now"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
