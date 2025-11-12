import * as React from "react";
import type { ProjectMetrics as ProjectMetricsType } from "@/lib/projects-data";
import { cn } from "@/lib/utils";

interface ProjectMetricsProps {
  metrics: ProjectMetricsType;
  className?: string;
}

export function ProjectMetrics({ metrics, className }: ProjectMetricsProps) {
  const { tasksCompleted, totalTasks, progress, teamSize, daysRemaining } = metrics;

  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Progress</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Tasks</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{tasksCompleted}</span>
          <span className="text-sm text-muted-foreground">/ {totalTasks}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Team Size</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{teamSize}</span>
          <span className="text-sm text-muted-foreground">members</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Time Remaining</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">
            {daysRemaining > 0 ? daysRemaining : "—"}
          </span>
          {daysRemaining > 0 && (
            <span className="text-sm text-muted-foreground">days</span>
          )}
        </div>
      </div>
    </div>
  );
}
