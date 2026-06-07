"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AdminResults from "@/components/AdminResults";
import Dialog from "@/components/Dialog";
import type { ElectionResults } from "@/lib/types";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [errorDialog, setErrorDialog] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: "" });

  useEffect(() => {
    async function checkAdminSession() {
      const res = await fetch("/api/admin/results");
      if (res.ok) {
        setLoggedIn(true);
      }
    }
    checkAdminSession();
  }, []);

  useEffect(() => {
    if (!loggedIn) return;

    loadResults(); // Initial fetch

    const intervalId = setInterval(loadResults, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [loggedIn]);

  async function loadResults() {
    const res = await fetch("/api/admin/results");
    if (res.ok) {
      const data = await res.json();
      setResults(data.results);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      setLoggedIn(true);
    } else {
      setErrorDialog(true);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setLoggedIn(false);
    setResults(null);
  }

  async function handleReset() {
    setResetting(true);
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      const data = await res.json();
      setResetConfirm(false);
      if (res.ok && data.ok) {
        setResetSuccess({
          open: true,
          message:
            data.message ??
            `Reset complete. ${data.students_reset ?? 0} student records cleared.`,
        });
        await loadResults();
      } else {
        setErrorDialog(true);
      }
    } catch {
      setResetConfirm(false);
      setErrorDialog(true);
    } finally {
      setResetting(false);
    }
  }

  if (!loggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 animate-page-entry">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="mt-2 text-slate-400">Election results dashboard</p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 py-3 font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <Dialog
          open={errorDialog}
          title="Invalid Credentials"
          message="Admin username or password is incorrect."
          variant="error"
          onClose={() => setErrorDialog(false)}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-10 animate-page-entry">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Election Results</h1>
            <p className="text-slate-400">Admin dashboard — live vote tallies</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/analytics"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]"
            >
              Turnout Analytics
            </Link>
            <button
              type="button"
              onClick={loadResults}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/30"
            >
              Logout
            </button>
          </div>
        </div>

        <section className="mb-8 rounded-2xl border border-orange-500/40 bg-orange-950/30 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-orange-200">
                Reset Election Data
              </h2>
              <p className="mt-1 text-sm text-orange-100/80">
                Clear all votes so every student can vote again. Student accounts
                are kept.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              className="shrink-0 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-orange-400"
            >
              Reset All Votes
            </button>
          </div>
        </section>

        {results ? (
          <AdminResults results={results} />
        ) : (
          <p className="text-slate-400">Loading results...</p>
        )}
      </div>

      <Dialog
        open={resetConfirm}
        title="Reset Election?"
        message="This will clear ALL votes for every student. Student accounts stay in the database, but everyone can vote again from scratch. This cannot be undone."
        variant="error"
        cancelLabel="Cancel"
        actionLabel={resetting ? "Resetting..." : "Yes, Reset All Votes"}
        disabled={resetting}
        onClose={() => setResetConfirm(false)}
        onAction={handleReset}
      />
      <Dialog
        open={resetSuccess.open}
        title="Election Reset"
        message={resetSuccess.message}
        variant="success"
        onClose={() => setResetSuccess({ open: false, message: "" })}
      />
    </main>
  );
}
