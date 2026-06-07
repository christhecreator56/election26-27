"use client";

import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Download,
  X,
  SlidersHorizontal,
  BarChart3,
  List,
  CheckCircle,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import type { ElectionResults } from "@/lib/types";

type AdminResultsProps = {
  results: ElectionResults;
};

// Modern Interactive SVG Bar Chart Component
type InteractiveBarChartProps = {
  title: string;
  items: ElectionResults["spl_tally"];
  type: "spl" | "aspl";
};

function InteractiveBarChart({ title, items, type }: InteractiveBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const totalVotes = useMemo(() => items.reduce((sum, item) => sum + item.vote_count, 0), [items]);
  const maxVotes = useMemo(() => Math.max(...items.map((i) => i.vote_count), 1), [items]);

  // SVG parameters
  const svgWidth = 500;
  const svgHeight = 280;
  const chartHeight = 180;
  const yBase = 220;
  const startX = 60;
  const chartWidth = 400;

  const spacing = items.length > 0 ? chartWidth / items.length : 100;
  const barWidth = Math.min(spacing * 0.55, 60);

  // Y-axis grid lines mapping
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-white/15">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
          <p className="text-xs text-slate-400">Total votes: {totalVotes}</p>
        </div>
        <TrendingUp className={`h-5 w-5 ${type === "spl" ? "text-sky-400" : "text-purple-400"}`} />
      </div>

      <div className="relative w-full overflow-visible">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            {/* Gradients */}
            <linearGradient id="splGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="asplGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
            {/* Glow Filter */}
            <filter id="svgGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {gridLines.map((ratio, index) => {
            const y = yBase - ratio * chartHeight;
            const labelValue = Math.round(ratio * maxVotes);
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
            const voteCount = item.vote_count;
            // Draw a tiny placeholder height if votes are 0 so bar is still hoverable
            const barHeight = maxVotes > 0 ? (voteCount / maxVotes) * chartHeight : 0;
            const renderHeight = Math.max(barHeight, 4);
            const barY = yBase - renderHeight;

            const isHovered = hoveredIndex === idx;
            const gradientId = type === "spl" ? "url(#splGrad)" : "url(#asplGrad)";

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
              <g key={item.id}>
                {/* Visual Bar */}
                <path
                  d={pathD}
                  fill={gradientId}
                  filter={isHovered ? "url(#svgGlow)" : "none"}
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
                  {item.name.length > 15 ? `${item.name.slice(0, 13)}...` : item.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Interactive Tooltip */}
        {hoveredIndex !== null && (() => {
          const item = items[hoveredIndex];
          const percent = totalVotes > 0 ? Math.round((item.vote_count / totalVotes) * 100) : 0;
          const xOffset = startX + hoveredIndex * spacing + spacing / 2;
          const barHeight = maxVotes > 0 ? (item.vote_count / maxVotes) * chartHeight : 0;
          const yOffset = yBase - Math.max(barHeight, 4);

          return (
            <div
              className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full bg-slate-950/95 border border-white/15 px-3 py-2 rounded-xl text-xs text-white shadow-2xl backdrop-blur-md transition-all duration-200 animate-fade-in"
              style={{
                left: `${(xOffset / svgWidth) * 100}%`,
                top: `${(yOffset / svgHeight) * 100 - 3}%`,
              }}
            >
              <div className="font-bold text-sky-300">{item.name}</div>
              <div className="mt-1 flex justify-between gap-4 text-slate-400">
                <span>Votes: <strong className="text-white">{item.vote_count}</strong></span>
                <span>Share: <strong className="text-white">{percent}%</strong></span>
              </div>
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-950"></div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// Side-by-side progress-bars view for comparison
function TallySection({
  title,
  items,
}: {
  title: string;
  items: ElectionResults["spl_tally"];
}) {
  const maxVotes = Math.max(...items.map((i) => i.vote_count), 1);
  const leader = items[0];

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
      <h2 className="text-lg font-bold text-amber-300 tracking-wide">{title}</h2>
      {leader && (
        <p className="mt-2 text-xs text-slate-300">
          Leading: <span className="font-semibold text-white">{leader.name}</span>{" "}
          ({leader.vote_count} votes)
        </p>
      )}
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-white font-medium">{item.name}</span>
              <span className="text-amber-300 font-semibold">{item.vote_count}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${(item.vote_count / maxVotes) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminResults({ results }: AdminResultsProps) {
  // Navigation / Tab states
  const [viewMode, setViewMode] = useState<"visual" | "list">("visual");

  // Filtering States for Vote Audit Log columns
  const [admissionSearch, setAdmissionSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [splFilter, setSplFilter] = useState("all");
  const [asplFilter, setAsplFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Generate dynamic dropdown values
  const uniqueClasses = useMemo(() => {
    const classes = new Set(results.voters.map((v) => v.class).filter(Boolean));
    return Array.from(classes).sort();
  }, [results.voters]);

  const uniqueSections = useMemo(() => {
    const sections = new Set(results.voters.map((v) => v.section).filter(Boolean));
    return Array.from(sections).sort();
  }, [results.voters]);

  const splCandidates = useMemo(() => results.spl_tally.map((c) => c.name), [results.spl_tally]);
  const asplCandidates = useMemo(() => results.aspl_tally.map((c) => c.name), [results.aspl_tally]);

  // Compute Filtered dataset
  const filteredVoters = useMemo(() => {
    return results.voters.filter((v) => {
      const matchesAdmission = v.admission_number
        .toLowerCase()
        .includes(admissionSearch.toLowerCase().trim());
      const matchesName = v.name.toLowerCase().includes(nameSearch.toLowerCase().trim());

      const matchesClass = classFilter === "all" || v.class === classFilter;
      const matchesSection = sectionFilter === "all" || v.section === sectionFilter;

      const matchesSpl =
        splFilter === "all" ||
        (splFilter === "none" && !v.spl_vote) ||
        v.spl_vote === splFilter;

      const matchesAspl =
        asplFilter === "all" ||
        (asplFilter === "none" && !v.aspl_vote) ||
        v.aspl_vote === asplFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && v.completed_at) ||
        (statusFilter === "partial" && !v.completed_at);

      return (
        matchesAdmission &&
        matchesName &&
        matchesClass &&
        matchesSection &&
        matchesSpl &&
        matchesAspl &&
        matchesStatus
      );
    });
  }, [
    results.voters,
    admissionSearch,
    nameSearch,
    classFilter,
    sectionFilter,
    splFilter,
    asplFilter,
    statusFilter,
  ]);

  // Reset Filters handler
  const resetFilters = () => {
    setAdmissionSearch("");
    setNameSearch("");
    setClassFilter("all");
    setSectionFilter("all");
    setSplFilter("all");
    setAsplFilter("all");
    setStatusFilter("all");
  };

  // Export to Excel Handler using preinstalled xlsx dependency
  const exportToExcel = () => {
    const worksheetData = filteredVoters.map((v) => ({
      "Admission Number": v.admission_number,
      "Student Name": v.name,
      Class: v.class,
      Section: v.section,
      "SPL Vote Choice": v.spl_vote ?? "—",
      "ASPL Vote Choice": v.aspl_vote ?? "—",
      Status: v.completed_at ? "Completed" : "Partial",
      "Timestamp of completion": v.completed_at
        ? new Date(v.completed_at).toLocaleString()
        : "—",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Voters Audit Log");

    // Auto-fit column widths
    const max_lens = Object.keys(worksheetData[0] || {}).map((key) =>
      Math.max(
        key.length,
        ...worksheetData.map((row) => String((row as any)[key] ?? "").length)
      )
    );
    worksheet["!cols"] = max_lens.map((len) => ({ wch: len + 3 }));

    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Rosary_Election_Voters_${dateStr}.xlsx`);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Tally Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-slate-900/30 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-3 text-sky-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Completed Votes</p>
            <h3 className="text-2xl font-black text-white">{results.total_voted}</h3>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-white/5">
          <button
            onClick={() => setViewMode("visual")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
              viewMode === "visual"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Interactive Chart
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
              viewMode === "list"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Comparison List
          </button>
        </div>
      </div>

      {/* Main Charts area */}
      {viewMode === "visual" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <InteractiveBarChart title="School Leader (SPL) Votes" items={results.spl_tally} type="spl" />
          <InteractiveBarChart
            title="Assistant School Leader (ASPL) Votes"
            items={results.aspl_tally}
            type="aspl"
          />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <TallySection title="School Leader (SPL)" items={results.spl_tally} />
          <TallySection title="Assistant School Leader (ASPL)" items={results.aspl_tally} />
        </div>
      )}

      {/* Vote Audit Log table with Column Filtering and Excel download */}
      <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md shadow-xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-5 w-5 text-amber-300" />
            <div>
              <h2 className="text-xl font-bold text-white">Voter Records Audit Log</h2>
              <p className="text-xs text-slate-400">
                Filtered: showing {filteredVoters.length} of {results.voters.length} voters
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Reset Filters button */}
            {(admissionSearch ||
              nameSearch ||
              classFilter !== "all" ||
              sectionFilter !== "all" ||
              splFilter !== "all" ||
              asplFilter !== "all" ||
              statusFilter !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-950/20 px-3.5 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            )}

            {/* XLS Download Button */}
            <button
              type="button"
              onClick={exportToExcel}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-400 px-4 py-2 text-xs font-bold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.05)] cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <Download className="h-3.5 w-3.5" />
              Download XLSX
            </button>
          </div>
        </div>

        {/* Multi-Column Filters Controls */}
        <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 rounded-xl border border-white/5 bg-slate-950/40 p-4">
          {/* Admission No */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Admission No.
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={admissionSearch}
                onChange={(e) => setAdmissionSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/80 py-1.5 pl-7 pr-2.5 text-xs text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Student Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Student Name
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900/80 py-1.5 pl-7 pr-2.5 text-xs text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Class Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Class
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 py-1.5 px-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Section
            </label>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 py-1.5 px-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Sections</option>
              {uniqueSections.map((s) => (
                <option key={s} value={s}>
                  Section {s}
                </option>
              ))}
            </select>
          </div>

          {/* SPL Vote Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              SPL Vote
            </label>
            <select
              value={splFilter}
              onChange={(e) => setSplFilter(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 py-1.5 px-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Choices</option>
              <option value="none">No Vote</option>
              {splCandidates.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* ASPL Vote Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ASPL Vote
            </label>
            <select
              value={asplFilter}
              onChange={(e) => setAsplFilter(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 py-1.5 px-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Choices</option>
              <option value="none">No Vote</option>
              {asplCandidates.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/80 py-1.5 px-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="mt-4 overflow-x-auto">
          {filteredVoters.length > 0 ? (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="pb-3 pr-4 font-bold tracking-wide">Admission No.</th>
                  <th className="pb-3 pr-4 font-bold tracking-wide">Name</th>
                  <th className="pb-3 pr-4 font-bold tracking-wide">Class</th>
                  <th className="pb-3 pr-4 font-bold tracking-wide">SPL Vote</th>
                  <th className="pb-3 pr-4 font-bold tracking-wide">ASPL Vote</th>
                  <th className="pb-3 font-bold tracking-wide">Completed At</th>
                </tr>
              </thead>
              <tbody>
                {filteredVoters.map((v) => (
                  <tr
                    key={v.admission_number}
                    className="border-b border-white/5 text-slate-200 transition-colors duration-150 hover:bg-white/[0.02]"
                  >
                    <td className="py-3.5 pr-4 font-mono font-medium">{v.admission_number}</td>
                    <td className="py-3.5 pr-4 font-semibold text-white">{v.name}</td>
                    <td className="py-3.5 pr-4">
                      {v.class}-{v.section}
                    </td>
                    <td className="py-3.5 pr-4">
                      {v.spl_vote ? (
                        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-300">
                          {v.spl_vote}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4">
                      {v.aspl_vote ? (
                        <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
                          {v.aspl_vote}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 font-mono text-xs text-slate-400">
                      {v.completed_at ? (
                        <span className="flex items-center gap-1 text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          {new Date(v.completed_at).toLocaleString()}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-400/90 font-semibold">
                          <HelpCircle className="h-3 w-3" />
                          Partial
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center">
              <SlidersHorizontal className="mx-auto h-8 w-8 text-slate-600" />
              <h3 className="mt-3 text-sm font-semibold text-slate-400">No voters found</h3>
              <p className="mt-1 text-xs text-slate-500">
                Try adjusting your search query or reset active filters.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
