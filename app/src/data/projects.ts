import { Project } from "@/src/models";

const COVER_1 =
  "https://images.pexels.com/photos/35184836/pexels-photo-35184836.jpeg?auto=compress&cs=tinysrgb&w=940";
const COVER_2 =
  "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=940";
const COVER_3 =
  "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=940";
const COVER_4 =
  "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=940";
const GALLERY = [
  "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=940",
  "https://images.pexels.com/photos/35184836/pexels-photo-35184836.jpeg?auto=compress&cs=tinysrgb&w=940",
  "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=940",
];

const logo = (seed: string) =>
  `https://api.dicebear.com/7.x/shapes/png?seed=${seed}&backgroundColor=0A1330`;

const team = (members: [string, string, string][]) =>
  members.map(([name, role, avatar], i) => ({
    id: `t${i}`,
    name,
    role,
    avatar,
  }));

const AV1 = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80";
const AV2 = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80";
const AV3 = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80";

export const mockProjects: Project[] = [
  {
    id: "p1",
    name: "Pulse Health",
    category: "Apps",
    shortDescription: "A wellness companion that turns daily habits into measurable progress.",
    description:
      "Pulse Health is a cross-platform wellness app that helps users track habits, mood and activity in one calm, focused interface. Built with an offline-first architecture, it syncs seamlessly across devices and surfaces gentle, data-driven insights without overwhelming the user.",
    cover: COVER_1,
    logo: logo("pulse"),
    technologies: ["React Native", "TypeScript", "Node.js", "PostgreSQL"],
    gallery: GALLERY,
    demoUrl: "https://expo.dev",
    downloadUrl: "https://apps.apple.com",
    websiteUrl: "https://pulsehealth.app",
    team: team([
      ["Naledi Khumalo", "Lead Developer", AV1],
      ["Aisha Patel", "Product Designer", AV3],
    ]),
    ownerId: "g1",
    ownerName: "Naledi Khumalo",
    featured: true,
    createdAt: "2025-05-10T09:00:00Z",
  },
  {
    id: "p2",
    name: "Ledger Cloud",
    category: "Websites",
    shortDescription: "A real-time accounting platform for modern small businesses.",
    description:
      "Ledger Cloud is a web-based accounting platform with real-time reconciliation, multi-currency support and a clean dashboard. The backend handles thousands of concurrent transactions using an event-driven architecture and horizontal scaling.",
    cover: COVER_2,
    logo: logo("ledger"),
    technologies: ["Go", "React", "Kubernetes", "Kafka", "AWS"],
    gallery: GALLERY,
    demoUrl: "https://vercel.com",
    websiteUrl: "https://ledgercloud.io",
    team: team([["Sipho Ndlovu", "Backend Engineer", AV2]]),
    ownerId: "g2",
    ownerName: "Sipho Ndlovu",
    featured: true,
    createdAt: "2025-05-02T09:00:00Z",
  },
  {
    id: "p3",
    name: "Aurora Brand System",
    category: "Graphic Design",
    shortDescription: "A complete brand identity and design system for a fintech startup.",
    description:
      "Aurora is a comprehensive brand identity spanning logo, typography, colour, iconography and a Figma component library. The system scales from marketing site to native app while keeping a consistent, premium feel.",
    cover: COVER_3,
    logo: logo("aurora"),
    technologies: ["Figma", "Illustrator", "Branding", "Design Systems"],
    gallery: GALLERY,
    websiteUrl: "https://aurora.design",
    team: team([["Aisha Patel", "Design Lead", AV3]]),
    ownerId: "g3",
    ownerName: "Aisha Patel",
    featured: true,
    createdAt: "2025-04-28T09:00:00Z",
  },
  {
    id: "p4",
    name: "SentryScan",
    category: "Cybersecurity",
    shortDescription: "Automated vulnerability scanning for CI/CD pipelines.",
    description:
      "SentryScan integrates into CI/CD pipelines to detect vulnerabilities, secrets and misconfigurations before they reach production. It ships with a prioritised risk dashboard and actionable remediation guidance.",
    cover: COVER_4,
    logo: logo("sentry"),
    technologies: ["Python", "Docker", "Burp Suite", "GitHub Actions"],
    gallery: GALLERY,
    demoUrl: "https://github.com",
    websiteUrl: "https://sentryscan.io",
    team: team([["Thabo Mokoena", "Security Engineer", AV1]]),
    ownerId: "g4",
    ownerName: "Thabo Mokoena",
    featured: false,
    createdAt: "2025-05-14T09:00:00Z",
  },
  {
    id: "p5",
    name: "Nomad Maps",
    category: "Apps",
    shortDescription: "Offline-first travel maps with curated local guides.",
    description:
      "Nomad Maps lets travellers download detailed offline maps and access curated, community-driven guides without a data connection. Built for reliability in low-connectivity environments.",
    cover: COVER_1,
    logo: logo("nomad"),
    technologies: ["React Native", "MapLibre", "SQLite", "GraphQL"],
    gallery: GALLERY,
    downloadUrl: "https://play.google.com",
    websiteUrl: "https://nomadmaps.app",
    team: team([["Naledi Khumalo", "Mobile Developer", AV1]]),
    ownerId: "g1",
    ownerName: "Naledi Khumalo",
    featured: false,
    createdAt: "2025-06-01T09:00:00Z",
  },
  {
    id: "p6",
    name: "Kinetic Reel",
    category: "Motion Graphics",
    shortDescription: "An animated brand explainer combining 2D and 3D motion.",
    description:
      "Kinetic Reel is a 45-second animated explainer produced for a product launch, blending 2D vector animation with subtle 3D elements. Delivered as optimised Lottie and video assets for web and mobile.",
    cover: COVER_3,
    logo: logo("kinetic"),
    technologies: ["After Effects", "Cinema 4D", "Lottie", "Premiere Pro"],
    gallery: GALLERY,
    demoUrl: "https://vimeo.com",
    team: team([["Aisha Patel", "Motion Designer", AV3]]),
    ownerId: "g3",
    ownerName: "Aisha Patel",
    featured: false,
    createdAt: "2025-05-22T09:00:00Z",
  },
  {
    id: "p7",
    name: "GrowthOS",
    category: "Digital Marketing",
    shortDescription: "A growth analytics dashboard for early-stage startups.",
    description:
      "GrowthOS unifies acquisition, activation and retention metrics into a single dashboard, with automated funnel insights and cohort analysis to help founders make faster decisions.",
    cover: COVER_2,
    logo: logo("growth"),
    technologies: ["Next.js", "Analytics", "SEO", "HubSpot API"],
    gallery: GALLERY,
    websiteUrl: "https://growthos.io",
    team: team([["Lerato Dlamini", "Growth Lead", AV2]]),
    ownerId: "g5",
    ownerName: "Lerato Dlamini",
    featured: false,
    createdAt: "2025-06-05T09:00:00Z",
  },
  {
    id: "p8",
    name: "Folio Studio",
    category: "Websites",
    shortDescription: "A blazing-fast portfolio builder for creatives.",
    description:
      "Folio Studio is a headless portfolio platform that lets creatives publish beautiful, performant sites in minutes. Achieves perfect Lighthouse scores with edge rendering and image optimisation.",
    cover: COVER_2,
    logo: logo("folio"),
    technologies: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
    gallery: GALLERY,
    demoUrl: "https://vercel.com",
    websiteUrl: "https://folio.studio",
    team: team([["Daniel Roberts", "Frontend Engineer", AV2]]),
    ownerId: "g6",
    ownerName: "Daniel Roberts",
    featured: false,
    createdAt: "2025-06-10T09:00:00Z",
  },
];
