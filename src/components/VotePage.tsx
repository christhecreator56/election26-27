"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CandidateCard from "@/components/CandidateCard";
import Dialog from "@/components/Dialog";
import type { Candidate } from "@/lib/types";

type VotePageProps = {
  role: "spl" | "aspl";
  title: string;
  subtitle: string;
};

export default function VotePage({ role, title, subtitle }: VotePageProps) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: "success" | "error" | "info";
    onAction?: () => void;
  }>({ open: false, title: "", message: "", variant: "info" });

  useEffect(() => {
    async function init() {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.replace("/");
        return;
      }
      const me = await meRes.json();
      if (me.already_voted) {
        setDialog({
          open: true,
          title: "Already Voted",
          message: "You have already completed your vote. Each student can vote only once.",
          variant: "error",
          onAction: () => router.replace("/"),
        });
        setLoading(false);
        return;
      }
      if (role === "spl" && me.has_voted_spl) {
        router.replace("/vote/aspl");
        return;
      }
      if (role === "aspl" && !me.has_voted_spl) {
        router.replace("/vote/spl");
        return;
      }
      if (role === "aspl" && me.has_voted_aspl) {
        router.replace("/vote/complete");
        return;
      }

      const res = await fetch(`/api/candidates?role=${role}`);
      const data = await res.json();
      setCandidates(data.candidates ?? []);
      setLoading(false);
    }
    init();
  }, [role, router]);

  async function handleVote(candidateId: string) {
    setVotingId(candidateId);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, candidateId }),
      });
      const data = await res.json();

      if (!data.ok) {
        if (data.error === "already_voted") {
          setDialog({
            open: true,
            title: "Already Voted",
            message: "You have already cast your vote for this position.",
            variant: "error",
          });
        } else {
          setDialog({
            open: true,
            title: "Vote Failed",
            message: "Unable to record your vote. Please try again.",
            variant: "error",
          });
        }
        return;
      }

      const isSpl = role === "spl";
      setDialog({
        open: true,
        title: "Successfully Voted!",
        message: isSpl
          ? "Your School Leader vote has been recorded. You will now vote for Assistant School Leader."
          : "Your Assistant School Leader vote has been recorded. Thank you for voting!",
        variant: "success",
        onAction: () =>
          router.push(isSpl ? "/vote/aspl" : "/vote/complete"),
      });
    } catch {
      setDialog({
        open: true,
        title: "Error",
        message: "Something went wrong. Please try again.",
        variant: "error",
      });
    } finally {
      setVotingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 animate-page-entry">
        <p className="text-slate-400">Loading candidates...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-950 px-4 py-20 overflow-hidden animate-page-entry">
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

      <div className="relative mx-auto max-w-7xl z-10">
        <header className="mb-14 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400 glow-text-blue">
            {subtitle}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-5xl text-gradient-blue">
            {title}
          </h1>
          <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto">
            Select one candidate below and click **Vote Now** to submit your response
          </p>
        </header>

        <div
          className={`grid gap-8 ${
            candidates.length === 4
              ? "sm:grid-cols-2 lg:grid-cols-4"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {candidates.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              onVote={handleVote}
              loading={votingId === c.id}
              disabled={!!votingId}
            />
          ))}
        </div>
      </div>

      <Dialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        variant={dialog.variant}
        onClose={() => setDialog((d) => ({ ...d, open: false }))}
        actionLabel="Continue"
        onAction={dialog.onAction ?? (() => setDialog((d) => ({ ...d, open: false })))}
      />
    </main>
  );
}
