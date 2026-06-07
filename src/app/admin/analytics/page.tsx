"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  CheckSquare,
  Percent,
  BarChart3,
  SlidersHorizontal,
  Info,
} from "lucide-react";

type TurnoutStat = {
  class?: string;
  section?: string;
  total: number;
  voted: number;
};

type AnalyticsData = {
  summary: {
    total_students: number;
    total_voted: number;
    turnout_percentage: number;
  };
  class_turnout: TurnoutStat[];
  section_turnout: TurnoutStat[];
  class_section_turnout: TurnoutStat[];
};

// Interactive SVG Turnout Bar Chart Component
type InteractiveTurnoutChartProps = {
  title: string;
  items: TurnoutStat[];
  labelKey: "class" | "section";
  themeColor: "sky" | "purple";
};

function InteractiveTurnoutChart({
  title,
  items,
  labelKey,
  themeColor,
}: InteractiveTurnoutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 280;
  const chartHeight = 180;
  const yBase = 220;
  const startX = 60;
  const chartWidth = 400;

  const spacing = items.length > 0 ? chartWidth / items.length : 100;
  const barWidth = Math.min(spacing * 0.55, 60);

  // Turnout charts always have a y-axis representing 0% to 100%
  const gridRatios = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-white/15">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
        <p className="text-xs text-slate-400">Student participation rates</p>
      </div>

      <div className="relative w-full overflow-visible">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            {/* Gradients */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
            {/* Glow Filter */}
            <filter id="turnoutGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {gridRatios.map((ratio, index) => {
            const y = yBase - ratio * chartHeight;
            const labelValue = `${Math.round(ratio * 100)}%`;
            return (
              <g key={index} className="opacity-40">
                <line
                  x1={startX}
                  y1={y}
                  x2={startX + chartWidth}
                  y2={y}
                  stroke="#475569"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                />
                <text
                  x={startX - 10}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="end"
                >
                  {labelValue}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {items.map((item, idx) => {
            const xOffset = startX + idx * spacing + (spacing - barWidth) / 2;
            const turnoutPercent = item.total > 0 ? item.voted / item.total : 0;
            const barHeight = turnoutPercent * chartHeight;
            // Draw a tiny placeholder height if turnout is 0 so bar is still hoverable
            const renderHeight = Math.max(barHeight, 4);
            const barY = yBase - renderHeight;

            const isHovered = hoveredIndex === idx;
            const gradientId = themeColor === "sky" ? "url(#skyGrad)" : "url(#purpleGrad)";
            const label = labelKey === "class" ? `Class ${item.class}` : `Sec ${item.section}`;

            // Draw paths with rounded top corners
            const r = Math.min(6, renderHeight);
            const pathD = `
              M ${xOffset} ${yBase}
              L ${xOffset} ${barY + r}
              A ${r} ${r} 0 0 1 ${xOffset + r} ${barY}
              L ${xOffset + barWidth - r} ${barY}
              A ${r} ${r} 0 0 1 ${xOffset + barWidth} ${barY + r}
              L ${xOffset + barWidth} ${yBase}
              Z
            `;

            return (
              <g key={idx}>
                {/* Visual Bar */}
                <path
                  d={pathD}
                  fill={gradientId}
                  filter={isHovered ? "url(#turnoutGlow)" : "none"}
                  className="transition-all duration-300 ease-out cursor-pointer"
                  opacity={hoveredIndex === null || isHovered ? 1 : 0.6}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Candidate label */}
                <text
                  x={xOffset + barWidth / 2}
                  y={yBase + 16}
                  fill={isHovered ? "#ffffff" : "#94a3b8"}
                  fontSize="9.5"
                  fontWeight={isHovered ? "700" : "500"}
                  textAnchor="middle"
                  className="transition-colors duration-200"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Interactive Tooltip */}
        {hoveredIndex !== null && (() => {
          const item = items[hoveredIndex];
          const percent = item.total > 0 ? Math.round((item.voted / item.total) * 100) : 0;
          const xOffset = startX + hoveredIndex * spacing + spacing / 2;
          const turnoutPercent = item.total > 0 ? item.voted / item.total : 0;
          const yOffset = yBase - Math.max(turnoutPercent * chartHeight, 4);
          const label = labelKey === "class" ? `Class ${item.class}` : `Section ${item.section}`;

          return (
            <div
              className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full bg-slate-950/95 border border-white/15 px-3 py-2 rounded-xl text-xs text-white shadow-2xl backdrop-blur-md transition-all duration-200"
              style={{
                left: `${(xOffset / svgWidth) * 100}%`,
                top: `${(yOffset / svgHeight) * 100 - 3}%`,
              }}
            >
              <div className="font-bold text-sky-300">{label}</div>
              <div className="mt-1 flex flex-col gap-1 text-[11px] text-slate-400">
                <span>Voted: <strong className="text-white">{item.voted} / {item.total}</strong></span>
                <span>Turnout: <strong className="text-white">{percent}%</strong></span>
              </div>
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-950"></div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) {
          router.replace("/admin");
          return;
        }
        const raw = await res.json();
        setData(raw);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching turnout analytics:", err);
      }
    }

    fetchAnalytics(); // Initial fetch

    const intervalId = setInterval(fetchAnalytics, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [router]);

  // Compute unique filter lists from data
  const classes = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.class_section_turnout.map((item) => item.class).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const sections = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.class_section_turnout.map((item) => item.section).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  // Filter breakdown list
  const filteredBreakdown = useMemo(() => {
    if (!data) return [];
    return data.class_section_turnout.filter((item) => {
      const comb = `${item.class}-${item.section}`.toLowerCase();
      const matchesSearch = comb.includes(searchQuery.toLowerCase().trim());
      const matchesClass = classFilter === "all" || item.class === classFilter;
      const matchesSection = sectionFilter === "all" || item.section === sectionFilter;
      return matchesSearch && matchesClass && matchesSection;
    });
  }, [data, searchQuery, classFilter, sectionFilter]);

  if (loading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-400">Loading turnout statistics...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-950 px-4 py-10 overflow-hidden animate-page-entry text-slate-200">
      {/* Background Animated Blobs */}
      <div className="absolute top-1/4 left-1/4 h-[35rem] w-[35rem] rounded-full bg-blue-600/5 blur-[130px] animate-float-slow pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[40rem] w-[40rem] rounded-full bg-purple-500/5 blur-[150px] animate-float-medium pointer-events-none"></div>

      <div className="relative mx-auto max-w-7xl z-10">
        {/* Header navigation bar */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sky-400">
              <span>Rosary Matriculation Hr Sec School</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-700"></span>
              <span>Admin Portal</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl text-gradient-blue">
              Student Turnout Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live statistics of voter participation by class and section
            </p>
          </div>

          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/30 px-4.5 py-2.5 text-xs font-bold text-slate-300 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </header>

        {/* Turnout Summary Cards Grid */}
        <div className="mb-10 grid gap-6 grid-cols-1 sm:grid-cols-3">
          {/* Voted Count */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 backdrop-blur shadow-xl flex items-center gap-4">
            <div className="rounded-xl bg-blue-500/10 p-3.5 text-sky-400">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Votes Cast</p>
              <h3 className="text-2xl font-black text-white mt-0.5">{data.summary.total_voted}</h3>
            </div>
          </div>

          {/* Eligible Students */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 backdrop-blur shadow-xl flex items-center gap-4">
            <div className="rounded-xl bg-purple-500/10 p-3.5 text-purple-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Eligible Students</p>
              <h3 className="text-2xl font-black text-white mt-0.5">{data.summary.total_students}</h3>
            </div>
          </div>

          {/* Turnout Rate */}
          <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 p-6 backdrop-blur shadow-xl flex items-center gap-4">
            <div className="rounded-xl bg-sky-500/10 p-3.5 text-sky-400 animate-pulse-glow">
              <Percent className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Turnout Rate</p>
              <h3 className="text-2xl font-black text-white mt-0.5">{data.summary.turnout_percentage}%</h3>
            </div>
          </div>
        </div>

        {/* Charts area */}
        <div className="mb-10 grid gap-6 md:grid-cols-2">
          <InteractiveTurnoutChart
            title="Class Turnout Rate"
            items={data.class_turnout}
            labelKey="class"
            themeColor="sky"
          />
          <InteractiveTurnoutChart
            title="Section Turnout Rate"
            items={data.section_turnout}
            labelKey="section"
            themeColor="purple"
          />
        </div>

        {/* Turnout Breakdown list */}
        <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur shadow-xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="h-5 w-5 text-amber-300" />
              <div>
                <h2 className="text-xl font-bold text-white">Class-Section Leaderboard</h2>
                <p className="text-xs text-slate-400">
                  Participation rate breakdown for each classroom
                </p>
              </div>
            </div>
          </div>

          {/* Filter Controls Row */}
          <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-3 rounded-xl border border-white/5 bg-slate-950/40 p-4">
            {/* Search */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Search Class/Section
              </label>
              <input
                type="text"
                placeholder="e.g. 10-A, 11-B..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/80 py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Class */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Class
              </label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/80 py-2 px-3.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Classes</option>
                {classes.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Section
              </label>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/80 py-2 px-3.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Sections</option>
                {sections.map((s) => (
                  <option key={s} value={s}>
                    Section {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="overflow-x-auto">
            {filteredBreakdown.length > 0 ? (
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="pb-3 pr-4 font-bold tracking-wide">Class & Section</th>
                    <th className="pb-3 pr-4 font-bold tracking-wide">Voted Participation</th>
                    <th className="pb-3 pr-4 font-bold tracking-wide">Voted Count</th>
                    <th className="pb-3 pr-4 font-bold tracking-wide">Eligible Count</th>
                    <th className="pb-3 font-bold tracking-wide">Turnout %</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBreakdown
                    .map((item) => {
                      const rate = item.total > 0 ? (item.voted / item.total) * 100 : 0;
                      return { ...item, rate };
                    })
                    .sort((a, b) => b.rate - a.rate) // sort by turnout percentage (highest first)
                    .map((item, index) => {
                      const turnoutColor =
                        item.rate >= 80
                          ? "bg-emerald-500"
                          : item.rate >= 50
                          ? "bg-sky-500"
                          : item.rate >= 20
                          ? "bg-purple-500"
                          : "bg-red-500";

                      return (
                        <tr
                          key={index}
                          className="border-b border-white/5 text-slate-200 transition-colors hover:bg-white/[0.01]"
                        >
                          <td className="py-4 pr-4 font-bold text-white">
                            Class {item.class} - {item.section}
                          </td>
                          <td className="py-4 pr-4 w-[240px]">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                                <div
                                  className={`h-full rounded-full ${turnoutColor} transition-all duration-500`}
                                  style={{ width: `${item.rate}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-slate-400 w-10 text-right">
                                {Math.round(item.rate)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 pr-4 font-semibold text-slate-200">{item.voted}</td>
                          <td className="py-4 pr-4 font-semibold text-slate-300">{item.total}</td>
                          <td className="py-4">
                            <span
                              className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ${
                                item.rate >= 80
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                  : item.rate >= 50
                                  ? "bg-sky-500/10 text-sky-300 border border-sky-500/20"
                                  : "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                              }`}
                            >
                              {item.rate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center">
                <Info className="mx-auto h-8 w-8 text-slate-600" />
                <h3 className="mt-3 text-sm font-semibold text-slate-400">No turnout records matched</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try adjusting the class or section filters.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
