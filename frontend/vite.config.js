import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";

function spaRoutesPlugin() {
  return {
    name: "spa-routes-generator",
    closeBundle() {
      const distPath = path.resolve(__dirname, "dist");
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        const routes = ["blug", "blog"];
        for (const route of routes) {
          const routeDir = path.join(distPath, route);
          if (!fs.existsSync(routeDir)) {
            fs.mkdirSync(routeDir, { recursive: true });
          }
          fs.copyFileSync(indexPath, path.join(routeDir, "index.html"));
        }
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), spaRoutesPlugin()],
  server: { proxy: { "/api": "http://127.0.0.1:8000" } },
});

