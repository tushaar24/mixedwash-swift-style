import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
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
    cssCodeSplit: false, // Keep critical CSS together
    rollupOptions: {
      treeshake: true,
      output: {
        // Optimize chunking strategy
        manualChunks: {
          // Critical above-the-fold bundle
          'critical': [
            'react',
            'react-dom',
            './src/components/Navbar.tsx',
            './src/components/Hero.tsx'
          ],
          // Vendor libraries
          'vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            'lucide-react',
            'react-router-dom'
          ],
          // Deferred components bundle
          'deferred': [
            './src/components/Services.tsx',
            './src/components/WhyChooseUs.tsx',
            './src/components/HowItWorks.tsx',
            './src/components/FAQ.tsx',
            './src/components/Footer.tsx'
          ]
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
        entryFileNames: 'assets/js/main-[hash].js',
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
