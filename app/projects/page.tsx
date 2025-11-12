import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProjectCard } from "@/components/project-card";
import { ProjectStats } from "@/components/project-stats";
import { mockProjects, getProjectStats } from "@/lib/projects-data";

export default function ProjectsPage() {
  const stats = getProjectStats();

  return (
    <div className="mx-auto max-w-7xl flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl tracking-tight font-heading">Projects</h1>
              <p className="text-muted-foreground">
                Overview of all active and completed projects
              </p>
            </div>
            <ThemeToggle />
          </div>

          {/* Project Statistics */}
          <ProjectStats
            total={stats.total}
            active={stats.active}
            completed={stats.completed}
            atRisk={stats.atRisk}
            className="mt-4"
          />
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </main>
    </div>
  );
}
