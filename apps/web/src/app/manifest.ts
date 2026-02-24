import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SoM Brain",
    short_name: "SoM Brain",
    description:
      "comprehensive Time Tracking, Project Management, and Issue Tracking (Micro-Brain) solution. It empowers organizations to manage clients, projects, tasks, and sprints while providing detailed insights through reporting and a dedicated client portal.",
    start_url: "/new",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
