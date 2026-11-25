import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kosh — mutual funds & stocks in one view",
    short_name: "Kosh",
    description: SITE_DESCRIPTION,
    start_url: "/app",
    display: "standalone",
    background_color: "#f6f4ee",
    theme_color: "#0b6b4f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
