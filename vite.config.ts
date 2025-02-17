
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/contexts": path.resolve(__dirname, "./src/contexts"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/integrations": path.resolve(__dirname, "./src/integrations"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/features/admin": path.resolve(__dirname, "./src/features/admin"),
      "@/features/community": path.resolve(__dirname, "./src/features/community"),
      "@/features/telegram-mini-app": path.resolve(__dirname, "./src/features/telegram-mini-app"),
      "@/hooks/admin": path.resolve(__dirname, "./src/hooks/admin"),
      "@/hooks/community": path.resolve(__dirname, "./src/hooks/community"),
      "@/hooks/telegram-mini-app": path.resolve(__dirname, "./src/hooks/telegram-mini-app"),
    },
  },
}));
