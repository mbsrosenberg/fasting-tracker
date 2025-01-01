// vite.config.js
import { defineConfig } from "file:///Users/michael/Documents/Coding%20Ideas/Fasting%20App/fasting-tracker/node_modules/vite/dist/node/index.js";
import react from "file:///Users/michael/Documents/Coding%20Ideas/Fasting%20App/fasting-tracker/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tailwindcss from "file:///Users/michael/Documents/Coding%20Ideas/Fasting%20App/fasting-tracker/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///Users/michael/Documents/Coding%20Ideas/Fasting%20App/fasting-tracker/node_modules/autoprefixer/lib/autoprefixer.js";
var vite_config_default = defineConfig({
  base: "/",
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer
      ]
    }
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "index.css")
            return "assets/styles.[hash].css";
          return "assets/[name].[hash].[ext]";
        }
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWljaGFlbC9Eb2N1bWVudHMvQ29kaW5nIElkZWFzL0Zhc3RpbmcgQXBwL2Zhc3RpbmctdHJhY2tlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL21pY2hhZWwvRG9jdW1lbnRzL0NvZGluZyBJZGVhcy9GYXN0aW5nIEFwcC9mYXN0aW5nLXRyYWNrZXIvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL21pY2hhZWwvRG9jdW1lbnRzL0NvZGluZyUyMElkZWFzL0Zhc3RpbmclMjBBcHAvZmFzdGluZy10cmFja2VyL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICd0YWlsd2luZGNzcydcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSAnYXV0b3ByZWZpeGVyJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYmFzZTogJy8nLFxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIGNzczoge1xuICAgIHBvc3Rjc3M6IHtcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgdGFpbHdpbmRjc3MsXG4gICAgICAgIGF1dG9wcmVmaXhlcixcbiAgICAgIF0sXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbykgPT4ge1xuICAgICAgICAgIGlmIChhc3NldEluZm8ubmFtZSA9PT0gJ2luZGV4LmNzcycpIHJldHVybiAnYXNzZXRzL3N0eWxlcy5baGFzaF0uY3NzJztcbiAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9bbmFtZV0uW2hhc2hdLltleHRdJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlYLFNBQVMsb0JBQW9CO0FBQ3RaLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLGtCQUFrQjtBQUd6QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsS0FBSztBQUFBLElBQ0gsU0FBUztBQUFBLE1BQ1AsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixnQkFBZ0IsQ0FBQyxjQUFjO0FBQzdCLGNBQUksVUFBVSxTQUFTO0FBQWEsbUJBQU87QUFDM0MsaUJBQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsU0FBUyxXQUFXO0FBQUEsRUFDaEM7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
