import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number;
  badge?: {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
  className?: string;
}

function StatsCard({ label, value, badge, className }: StatsCardProps) {
  return (
    <div className={cn("flex flex-col gap-2 p-4 border rounded-lg bg-card", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-3xl font-semibold">{value}</span>
        {badge && (
          <Badge variant={badge.variant} className="ml-auto">
            {badge.label}
          </Badge>
        )}
      </div>
    </div>
  );
}

interface ProjectStatsProps {
  total: number;
  active: number;
  completed: number;
  atRisk: number;
  className?: string;
}

export function ProjectStats({
  total,
  active,
  completed,
  atRisk,
  className,
}: ProjectStatsProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      <StatsCard label="Total Projects" value={total} />
      <StatsCard
        label="Active"
        value={active}
        badge={{ label: "Active", variant: "default" }}
      />
      <StatsCard
        label="Completed"
        value={completed}
        badge={{ label: "Done", variant: "secondary" }}
      />
      <StatsCard
        label="At Risk"
        value={atRisk}
        badge={atRisk > 0 ? { label: "Alert", variant: "destructive" } : undefined}
      />
    </div>
  );
}
