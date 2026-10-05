import { Graduate } from "@/src/models";

// Mock graduate directory. Structured identically to the future API response
// so graduateService can swap `mockGraduates` for a real fetch with no UI change.
export const mockGraduates: Graduate[] = [
  {
    id: "g1",
    name: "Naledi Khumalo",
    headline: "Full-Stack Developer & UI Engineer",
    specialization: "Apps",
    about:
      "BBD Select graduate specialising in production React Native and Flutter apps. Passionate about clean architecture, design systems and shipping fast, scalable products that people love to use.",
    skills: ["React Native", "TypeScript", "Node.js", "Figma", "PostgreSQL", "GraphQL"],
    avatar:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.pexels.com/photos/7562087/pexels-photo-7562087.jpeg?auto=compress&cs=tinysrgb&w=940",
    availableForWork: true,
    links: {
      email: "naledi@bbdselect.com",
      linkedin: "https://linkedin.com/in/naledi",
      github: "https://github.com/naledi",
      portfolio: "https://naledi.dev",
      website: "https://naledi.dev",
    },
    experience: [
      { id: "e1", company: "BBD Select", role: "Software Engineer", period: "2024 — Present" },
      { id: "e2", company: "Fintech Labs", role: "Mobile Developer Intern", period: "2023 — 2024" },
    ],
    resumeName: "Naledi_Khumalo_CV.pdf",
    projectIds: ["p1", "p5"],
    featured: true,
    createdAt: "2025-01-12T09:00:00Z",
  },
  {
    id: "g2",
    name: "Sipho Ndlovu",
    headline: "Backend Engineer — Distributed Systems",
    specialization: "Websites",
    about:
      "Focused on high-throughput backend services and cloud infrastructure. I build reliable APIs and event-driven systems that scale gracefully under load.",
    skills: ["Go", "Kubernetes", "AWS", "PostgreSQL", "Kafka", "Terraform"],
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.pexels.com/photos/35184836/pexels-photo-35184836.jpeg?auto=compress&cs=tinysrgb&w=940",
    availableForWork: true,
    links: {
      email: "sipho@bbdselect.com",
      linkedin: "https://linkedin.com/in/sipho",
      github: "https://github.com/sipho",
    },
    experience: [
      { id: "e1", company: "CloudScale", role: "Platform Engineer", period: "2024 — Present" },
    ],
    resumeName: "Sipho_Ndlovu_CV.pdf",
    projectIds: ["p2"],
    featured: true,
    createdAt: "2025-02-03T09:00:00Z",
  },
  {
    id: "g3",
    name: "Aisha Patel",
    headline: "Product Designer & Motion Specialist",
    specialization: "Graphic Design",
    about:
      "I craft delightful, accessible interfaces and bring them to life with motion. Design systems, prototyping and brand identity are my playground.",
    skills: ["Figma", "After Effects", "Lottie", "Branding", "Prototyping", "Illustration"],
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.pexels.com/photos/7562087/pexels-photo-7562087.jpeg?auto=compress&cs=tinysrgb&w=940",
    availableForWork: false,
    links: {
      email: "aisha@bbdselect.com",
      linkedin: "https://linkedin.com/in/aisha",
      portfolio: "https://aisha.design",
    },
    experience: [
      { id: "e1", company: "Studio North", role: "Product Designer", period: "2023 — Present" },
    ],
    resumeName: "Aisha_Patel_Portfolio.pdf",
    projectIds: ["p3", "p6"],
    featured: true,
    createdAt: "2025-02-20T09:00:00Z",
  },
  {
    id: "g4",
    name: "Thabo Mokoena",
    headline: "Cybersecurity Analyst",
    specialization: "Cybersecurity",
    about:
      "Offensive and defensive security engineer. I break systems to make them stronger — penetration testing, threat modelling and secure-by-design architecture.",
    skills: ["Penetration Testing", "Python", "Burp Suite", "SIEM", "Threat Modelling"],
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.pexels.com/photos/35184836/pexels-photo-35184836.jpeg?auto=compress&cs=tinysrgb&w=940",
    availableForWork: true,
    links: {
      email: "thabo@bbdselect.com",
      linkedin: "https://linkedin.com/in/thabo",
      github: "https://github.com/thabo",
    },
    experience: [
      { id: "e1", company: "SecureNet", role: "Security Analyst", period: "2024 — Present" },
    ],
    resumeName: "Thabo_Mokoena_CV.pdf",
    projectIds: ["p4"],
    featured: false,
    createdAt: "2025-03-05T09:00:00Z",
  },
  {
    id: "g5",
    name: "Lerato Dlamini",
    headline: "Growth & Digital Marketing Lead",
    specialization: "Digital Marketing",
    about:
      "Data-driven marketer building growth engines for early-stage products. SEO, paid acquisition, lifecycle and analytics are where I thrive.",
    skills: ["SEO", "Google Ads", "Analytics", "Content Strategy", "HubSpot"],
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.pexels.com/photos/7562087/pexels-photo-7562087.jpeg?auto=compress&cs=tinysrgb&w=940",
    availableForWork: true,
    links: {
      email: "lerato@bbdselect.com",
      linkedin: "https://linkedin.com/in/lerato",
      website: "https://lerato.marketing",
    },
    experience: [
      { id: "e1", company: "Launchpad", role: "Growth Marketer", period: "2023 — Present" },
    ],
    resumeName: "Lerato_Dlamini_CV.pdf",
    projectIds: ["p7"],
    featured: false,
    createdAt: "2025-03-18T09:00:00Z",
  },
  {
    id: "g6",
    name: "Daniel Roberts",
    headline: "Frontend Engineer — Web Platforms",
    specialization: "Websites",
    about:
      "I build fast, accessible web experiences with modern frameworks. Performance budgets, design fidelity and clean component APIs matter to me.",
    skills: ["React", "Next.js", "TypeScript", "Tailwind", "Vite", "Playwright"],
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    cover:
      "https://images.pexels.com/photos/35184836/pexels-photo-35184836.jpeg?auto=compress&cs=tinysrgb&w=940",
    availableForWork: true,
    links: {
      email: "daniel@bbdselect.com",
      linkedin: "https://linkedin.com/in/danielr",
      github: "https://github.com/danielr",
      portfolio: "https://danielroberts.dev",
    },
    experience: [
      { id: "e1", company: "Webflow Partners", role: "Frontend Engineer", period: "2024 — Present" },
    ],
    resumeName: "Daniel_Roberts_CV.pdf",
    projectIds: ["p8"],
    featured: false,
    createdAt: "2025-04-02T09:00:00Z",
  },
];
