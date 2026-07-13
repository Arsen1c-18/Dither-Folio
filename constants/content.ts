/**
 * Portfolio content — experience, projects, skills.
 * Placeholder but realistic data; swap freely without touching components.
 */
import type { ExperienceItem, Project, Skill } from "@/types";

export const experience: ExperienceItem[] = [
  {
    id: "exp-01",
    role: "Software Engineer",
    org: "Nebula Systems",
    period: "2024 — Present",
    current: true,
    summary:
      "Building distributed data pipelines and internal AI tooling. Led the migration to an event-driven architecture serving 2M+ daily events.",
  },
  {
    id: "exp-02",
    role: "Full-Stack Developer",
    org: "Loom Labs",
    period: "2022 — 2024",
    summary:
      "Shipped customer-facing dashboards in React and Next.js, and owned the GraphQL API layer end to end.",
  },
  {
    id: "exp-03",
    role: "Engineering Intern",
    org: "Orbit Digital",
    period: "2021 — 2022",
    summary:
      "Prototyped internal automation tools and contributed to the design-system component library.",
  },
];

export const projects: Project[] = [
  {
    id: "proj-01",
    title: "Synapse",
    description:
      "A retrieval-augmented chat platform with streaming responses and pluggable model backends.",
    year: "2025",
    category: "ai-ml",
    stack: ["Next.js", "Python", "pgvector", "Anthropic"],
    href: "#",
  },
  {
    id: "proj-02",
    title: "Meridian",
    description:
      "Real-time analytics dashboard visualizing millions of rows with sub-100ms interaction.",
    year: "2024",
    category: "web-apps",
    stack: ["React", "D3", "ClickHouse"],
    href: "#",
  },
  {
    id: "proj-03",
    title: "Forge CLI",
    description:
      "A developer tool that scaffolds, lints, and deploys micro-services from a single config.",
    year: "2024",
    category: "tools",
    stack: ["Go", "Cobra", "Docker"],
    href: "#",
  },
  {
    id: "proj-04",
    title: "Voxel",
    description:
      "An image-to-3D pipeline turning reference photos into printable meshes via a diffusion model.",
    year: "2023",
    category: "ai-ml",
    stack: ["PyTorch", "Three.js", "FastAPI"],
    href: "#",
  },
];

export const skills: Skill[] = [
  { name: "TypeScript", level: 92, category: "Languages" },
  { name: "Python", level: 88, category: "Languages" },
  { name: "Go", level: 72, category: "Languages" },
  { name: "React / Next.js", level: 94, category: "Frontend" },
  { name: "Three.js / WebGL", level: 68, category: "Frontend" },
  { name: "Node.js", level: 85, category: "Backend" },
  { name: "PostgreSQL", level: 80, category: "Backend" },
  { name: "Docker / K8s", level: 76, category: "Infra" },
  { name: "LLMs / RAG", level: 82, category: "AI/ML" },
];
