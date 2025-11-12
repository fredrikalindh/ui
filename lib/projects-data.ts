export type ProjectStatus = 
  | "active" 
  | "completed" 
  | "on-hold" 
  | "planning" 
  | "at-risk";

export interface ProjectMetrics {
  tasksCompleted: number;
  totalTasks: number;
  progress: number;
  teamSize: number;
  daysRemaining: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  metrics: ProjectMetrics;
  tags: string[];
  lastUpdated: string;
  owner: string;
}

// Mock data for demonstration
export const mockProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Platform Redesign",
    description: "Complete overhaul of the customer-facing e-commerce platform with focus on mobile experience and checkout flow optimization.",
    status: "active",
    metrics: {
      tasksCompleted: 24,
      totalTasks: 36,
      progress: 67,
      teamSize: 5,
      daysRemaining: 12,
    },
    tags: ["Frontend", "UX", "Mobile"],
    lastUpdated: "2025-11-10",
    owner: "Sarah Chen",
  },
  {
    id: "2",
    name: "API v2 Migration",
    description: "Migrate legacy REST endpoints to GraphQL and implement new authentication system with OAuth 2.0 support.",
    status: "at-risk",
    metrics: {
      tasksCompleted: 15,
      totalTasks: 42,
      progress: 36,
      teamSize: 3,
      daysRemaining: 8,
    },
    tags: ["Backend", "API", "Security"],
    lastUpdated: "2025-11-11",
    owner: "Marcus Johnson",
  },
  {
    id: "3",
    name: "Analytics Dashboard",
    description: "Build comprehensive analytics dashboard for tracking user behavior, conversion rates, and business metrics in real-time.",
    status: "active",
    metrics: {
      tasksCompleted: 32,
      totalTasks: 40,
      progress: 80,
      teamSize: 4,
      daysRemaining: 5,
    },
    tags: ["Frontend", "Data", "Visualization"],
    lastUpdated: "2025-11-12",
    owner: "Emily Rodriguez",
  },
  {
    id: "4",
    name: "Mobile App Launch",
    description: "Native iOS and Android applications with feature parity to web platform, including offline mode and push notifications.",
    status: "planning",
    metrics: {
      tasksCompleted: 3,
      totalTasks: 58,
      progress: 5,
      teamSize: 6,
      daysRemaining: 90,
    },
    tags: ["Mobile", "iOS", "Android"],
    lastUpdated: "2025-11-09",
    owner: "David Kim",
  },
  {
    id: "5",
    name: "Infrastructure Modernization",
    description: "Migrate to Kubernetes, implement CI/CD pipelines, and establish monitoring and observability best practices.",
    status: "completed",
    metrics: {
      tasksCompleted: 28,
      totalTasks: 28,
      progress: 100,
      teamSize: 3,
      daysRemaining: 0,
    },
    tags: ["DevOps", "Infrastructure", "Cloud"],
    lastUpdated: "2025-11-05",
    owner: "Alex Thompson",
  },
  {
    id: "6",
    name: "Customer Support Portal",
    description: "Self-service portal with ticket management, knowledge base, and live chat integration for customer support.",
    status: "on-hold",
    metrics: {
      tasksCompleted: 18,
      totalTasks: 35,
      progress: 51,
      teamSize: 2,
      daysRemaining: 0,
    },
    tags: ["Frontend", "Support", "Integration"],
    lastUpdated: "2025-10-28",
    owner: "Lisa Park",
  },
];

export function getProjectsByStatus(status: ProjectStatus): Project[] {
  return mockProjects.filter((project) => project.status === status);
}

export function getProjectStats() {
  return {
    total: mockProjects.length,
    active: getProjectsByStatus("active").length,
    completed: getProjectsByStatus("completed").length,
    atRisk: getProjectsByStatus("at-risk").length,
  };
}
