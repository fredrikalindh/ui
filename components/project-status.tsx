import * as React from "react";
import { Badge } from "@/components/ui/badge";
import type { ProjectStatus as ProjectStatusType } from "@/lib/projects-data";

const statusConfig: Record<
  ProjectStatusType,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  "on-hold": { label: "On Hold", variant: "outline" },
  planning: { label: "Planning", variant: "outline" },
  "at-risk": { label: "At Risk", variant: "destructive" },
};

interface ProjectStatusProps {
  status: ProjectStatusType;
  className?: string;
}

export function ProjectStatus({ status, className }: ProjectStatusProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
