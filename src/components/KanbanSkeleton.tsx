"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

// Simple skeleton card – matches JobCard layout but with pulse placeholders
function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 animate-pulse">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-6 h-6 bg-slate-800 rounded" />
        <div className="flex-1 h-4 bg-slate-800 rounded" />
      </div>
      <div className="h-3 bg-slate-800 rounded w-3/4 mb-2" />
      <div className="h-2 bg-slate-800 rounded w-1/2" />
    </div>
  );
}

interface KanbanSkeletonProps {
  // number of placeholder cards per column
  cardsPerColumn?: number;
}

export default function KanbanSkeleton({ cardsPerColumn = 3 }: KanbanSkeletonProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "skeleton" });

  const placeholderArray = Array.from({ length: cardsPerColumn });

  const columnStyles = {
    applied: { title: "Applied", textClass: "text-blue-400" },
    interview: { title: "Interview", textClass: "text-amber-400" },
    offer: { title: "Offer", textClass: "text-emerald-400" },
    rejected: { title: "Rejected", textClass: "text-rose-400" },
  } as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full items-start">
      {Object.entries(columnStyles).map(([status, style]) => (
        <div
          key={status}
          className="flex flex-col w-full min-w-[280px] bg-slate-900/15 border border-slate-800/80 rounded-2xl p-4 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className={`font-bold tracking-tight ${style.textClass}`}>{style.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full border font-semibold bg-slate-500/10 text-slate-400 border-slate-500/20">
              {cardsPerColumn}
            </span>
          </div>

          {/* Content */}
          <SortableContext items={[]} strategy={verticalListSortingStrategy}>
            <div
              ref={setNodeRef}
              className={`flex-1 flex flex-col gap-3 min-h-[500px] rounded-xl p-2 ${isOver ? "bg-slate-900/10" : ""}`}
            >
              {placeholderArray.map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </SortableContext>
        </div>
      ))}
    </div>
  );
}
