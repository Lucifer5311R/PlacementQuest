"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { BarChart2, Award, Sparkles } from "lucide-react";

interface Student {
  id: string;
  fullName: string;
  regNumber: string;
  email: string;
  skills: string | null;
  aptitudeScore: number | null;
  domainScore: number | null;
  placementStatus?: string;
}

interface AnalyticsChartsProps {
  students: Student[];
}

export default function AnalyticsCharts({ students }: AnalyticsChartsProps) {
  // Parse skills distribution
  const skillChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      if (!s.skills) return;
      s.skills.split(",").map(sk => sk.trim().toUpperCase()).filter(Boolean).forEach(sk => {
        counts[sk] = (counts[sk] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [students]);

  // Parse assessment stats
  const scoreStats = useMemo(() => {
    let perfect = 0; // 4/4 or 5/5
    let average = 0; // 2 or 3
    let low = 0; // 0 or 1
    let pending = 0;

    students.forEach(s => {
      if (s.aptitudeScore === null && s.domainScore === null) {
        pending++;
      } else {
        const apt = s.aptitudeScore || 0;
        const dom = s.domainScore || 0;
        // Normalise scores
        if (apt >= 3 || dom >= 4) {
          perfect++;
        } else if (apt >= 2 || dom >= 2) {
          average++;
        } else {
          low++;
        }
      }
    });

    return [
      { label: "Elite Tier", value: perfect, color: "bg-yellow-500" },
      { label: "Practice Tier", value: average, color: "bg-zinc-400" },
      { label: "Foundation Tier", value: low, color: "bg-zinc-650" },
      { label: "Testing Standby", value: pending, color: "bg-zinc-800" }
    ];
  }, [students]);

  // Parse placement funnel
  const placementFunnel = useMemo(() => {
    const counts = {
      Available: 0,
      Shortlisted: 0,
      Interviewing: 0,
      Placed: 0,
    };
    students.forEach((s) => {
      const status = s.placementStatus || "Available";
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      } else {
        counts.Available++;
      }
    });
    return [
      { label: "Placed", count: counts.Placed, color: "bg-yellow-500", textClass: "text-yellow-500" },
      { label: "Interviewing", count: counts.Interviewing, color: "bg-yellow-500/80", textClass: "text-yellow-500/80" },
      { label: "Shortlisted", count: counts.Shortlisted, color: "bg-zinc-400", textClass: "text-zinc-400" },
      { label: "Available", count: counts.Available, color: "bg-zinc-600", textClass: "text-zinc-500" },
    ];
  }, [students]);

  const maxSkillCount = skillChartData[0]?.count || 1;

  return (
    <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
      
      {/* 1. Skill Density Chart (SVG Bar Chart) */}
      <section className="panel p-5 space-y-4 border border-zinc-850 bg-zinc-950/20">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
          <BarChart2 className="h-4 w-4 text-yellow-500" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Skill Density Distribution
          </h3>
        </div>

        <div className="space-y-3 font-mono text-[10px]">
          {skillChartData.length > 0 ? (
            skillChartData.map((d, index) => {
              const widthPct = Math.max((d.count / maxSkillCount) * 100, 8);
              return (
                <div key={d.name} className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>{index + 1}. {d.name}</span>
                    <span className="text-white font-bold">{d.count} TALENTS</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-3 rounded border border-zinc-900 overflow-hidden flex items-center">
                    <div 
                      className="bg-yellow-500 h-full rounded-l transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-zinc-600 text-xs py-4 text-center">No skill analytics available.</p>
          )}
        </div>
      </section>

      {/* 2. Assessment Performance Distribution */}
      <section className="panel p-5 space-y-4 border border-zinc-850 bg-zinc-950/20">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Award className="h-4 w-4 text-yellow-500" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Evaluation Funnel Metrics
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          {scoreStats.map((stat) => (
            <div 
              key={stat.label} 
              className="p-3 bg-zinc-950 border border-zinc-900 rounded-lg flex flex-col justify-between"
            >
              <span className="text-[9px] text-zinc-500 font-bold uppercase">{stat.label}</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-bold text-white">{stat.value}</span>
                <span className="text-[10px] text-zinc-650 font-normal">STUDENTS</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className={cn("h-full", stat.color)} 
                  style={{ width: `${students.length ? (stat.value / students.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Recruitment Pipeline Funnel */}
      <section className="panel p-5 space-y-4 border border-zinc-850 bg-zinc-950/20 md:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Recruitment Status Funnel
          </h3>
        </div>

        <div className="space-y-3 font-mono text-[10px]">
          {placementFunnel.map((item) => {
            const widthPct = students.length ? (item.count / students.length) * 100 : 0;
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-zinc-400">
                  <span className={cn("font-bold", item.textClass)}>{item.label.toUpperCase()}</span>
                  <span className="text-white font-bold">{item.count} ({Math.round(widthPct)}%)</span>
                </div>
                <div className="w-full bg-zinc-950 h-3 rounded border border-zinc-900 overflow-hidden flex items-center">
                  <div 
                    className={cn("h-full rounded-l transition-all duration-500", item.color)}
                    style={{ width: `${Math.max(widthPct, item.count > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
