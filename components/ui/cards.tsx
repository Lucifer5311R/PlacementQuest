"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Check, Plus } from "lucide-react";

export function BentoCard({ children, className = "", ...props }: HTMLMotionProps<"div"> & { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      role="group"
      aria-label="card"
      whileHover={{ y: -2 }}
      className={cn(
        "bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-yellow-500/50 hover:bg-zinc-900/80 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type BadgeVariant = "default" | "gold" | "success" | "pending";
export function Badge({ children, variant = "default", className = "", ...props }: React.HTMLAttributes<HTMLSpanElement> & { children: React.ReactNode; variant?: BadgeVariant; className?: string }) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-zinc-900 text-zinc-300 border-zinc-800",
    gold: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-zinc-800/50 text-zinc-500 border-zinc-800",
  };
  return (
    <span className={cn(`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${variants[variant]}`, className)} {...props}>
      {children}
    </span>
  );
}

// Keep GoldButton name for backwards compatibility but styled in minimal black/yellow
export function GoldButton({ children, className = "", type = "button", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "px-4 py-2 bg-yellow-500 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-yellow-400 transition-all active:scale-[0.98] border border-yellow-500 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function RadialProgress({ value, size = 60, strokeWidth = 5, className = "" }: { value: number; size?: number; strokeWidth?: number; className?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="rotate-[-90deg]" width={size} height={size}>
        {/* Track */}
        <circle
          className="text-zinc-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Indicator */}
        <circle
          className="text-yellow-500 transition-all duration-500"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-xs font-mono font-bold text-white">{value}%</span>
    </div>
  );
}

export function ShortlistButton({ studentId, className = "" }: { studentId: string; className?: string }) {
  const [shortlisted, setShortlisted] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("shortlist") || "[]");
    setShortlisted(list.includes(studentId));

    const handleStorageChange = () => {
      const updatedList = JSON.parse(localStorage.getItem("shortlist") || "[]");
      setShortlisted(updatedList.includes(studentId));
    };

    window.addEventListener("storage", handleStorageChange);
    // Custom event to trigger update on the same page
    window.addEventListener("shortlist-update", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("shortlist-update", handleStorageChange);
    };
  }, [studentId]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const list = JSON.parse(localStorage.getItem("shortlist") || "[]");
    let newList;
    if (list.includes(studentId)) {
      newList = list.filter((id: string) => id !== studentId);
    } else {
      newList = [...list, studentId];
    }
    localStorage.setItem("shortlist", JSON.stringify(newList));
    window.dispatchEvent(new Event("shortlist-update"));
    setShortlisted(newList.includes(studentId));
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all active:scale-95",
        shortlisted
          ? "bg-yellow-500 border-yellow-500 text-black"
          : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white",
        className
      )}
    >
      {shortlisted ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Shortlisted
        </>
      ) : (
        <>
          <Plus className="h-3.5 w-3.5" />
          Shortlist
        </>
      )}
    </button>
  );
}
