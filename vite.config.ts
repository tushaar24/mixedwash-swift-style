import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
  build: {
    target: 'es2015',
    cssCodeSplit: true, // Enable CSS code splitting for better loading
    cssMinify: true,
    rollupOptions: {
      treeshake: true,
      output: {
        manualChunks: {
          // Core vendor chunk - keep minimal for initial load
          vendor: ['react', 'react-dom'],
          // Router and navigation - separate chunk
          router: ['react-router-dom'],
          // Supabase and auth - separate chunk since heavy
          supabase: ['@supabase/supabase-js'],
          // TanStack Query - separate chunk
          query: ['@tanstack/react-query'],
          // UI components - separate chunk
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-accordion'],
          // Icons and utilities
          utils: ['lucide-react', 'clsx', 'tailwind-merge']
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
          if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log'] : [],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    visualizer({
      filename: "stats.html",
      open: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
