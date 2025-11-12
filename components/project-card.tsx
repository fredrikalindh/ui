import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/ui/card";
import { ProjectStatus } from "@/components/project-status";
import { ProjectMetrics } from "@/components/project-metrics";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/projects-data";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const formattedDate = new Date(project.lastUpdated).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className={cn("w-full h-fit", className)}>
      <CardHeader className="border-b pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-2 truncate">{project.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          <ProjectStatus status={project.status} />
        </div>
      </CardHeader>

      <CardContent className="px-6 py-6">
        <ProjectMetrics metrics={project.metrics} />
      </CardContent>

      <CardFooter className="flex-col items-start gap-4 px-6 py-4 border-t">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <span>Owner: {project.owner}</span>
          <span>Updated {formattedDate}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
