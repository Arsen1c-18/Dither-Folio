/**
 * Site-wide identity & metadata.
 * Everything user-facing that identifies the portfolio owner lives here
 * so the whole site can be rebranded from a single file.
 */
export const site = {
  name: "Moksh Parashate",
  handle: "MOKSH_",
  role: "Software Engineer",
  tagline: "Building scalable systems, exploring AI and turning ideas into impact.",
  location: "Pune, IN",
  timezone: "Asia/Kolkata",
  email: "hello@example.com",
  available: true,
  resumeUrl: "/resume.pdf",
} as const;

export const socials = [
  { label: "GitHub", href: "https://github.com/", handle: "@moksh" },
  { label: "LinkedIn", href: "https://linkedin.com/in/", handle: "in/moksh" },
  { label: "X", href: "https://x.com/", handle: "@moksh" },
  { label: "Email", href: `mailto:hello@example.com`, handle: "hello@example.com" },
] as const;

export const nav = [
  { label: "Home", id: "hero" },
  { label: "About", id: "about" },
  { label: "Experience", id: "experience" },
  { label: "Projects", id: "projects" },
  { label: "Skills", id: "skills" },
  { label: "Contact", id: "contact" },
] as const;
