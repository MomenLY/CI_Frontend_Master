// vite.config.mts
import { defineConfig } from "file:///media/sreeja/Hdd/Documents/Enfin/Projects/CI/CIFrontEnd/agendaModule/ci_frontend/node_modules/vite/dist/node/index.js";
import react from "file:///media/sreeja/Hdd/Documents/Enfin/Projects/CI/CIFrontEnd/agendaModule/ci_frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import svgrPlugin from "file:///media/sreeja/Hdd/Documents/Enfin/Projects/CI/CIFrontEnd/agendaModule/ci_frontend/node_modules/vite-plugin-svgr/dist/index.js";
import tsconfigPaths from "file:///media/sreeja/Hdd/Documents/Enfin/Projects/CI/CIFrontEnd/agendaModule/ci_frontend/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react"
    }),
    tsconfigPaths({
      parseNative: false
    }),
    svgrPlugin(),
    {
      name: "custom-hmr-control",
      handleHotUpdate({ file, server }) {
        if (file.includes("src/app/configs/")) {
          server.ws.send({
            type: "full-reload"
          });
          return [];
        }
        return;
      }
    }
  ],
  build: {
    outDir: "build",
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "UNSUPPORTED_CSS_PROPERTY")
          return;
        warn(warning);
      }
    },
    target: "esnext"
    // or specify the browsers you are targeting
  },
  esbuild: {
    target: "esnext"
    // Ensure esbuild targets an environment that supports top-level await
  },
  server: {
    open: true,
    port: 3e3
  },
  define: {
    global: "window"
  },
  resolve: {
    alias: {
      "@": "/src",
      "@fuse": "/src/@fuse",
      "@history": "/src/@history",
      "@lodash": "/src/@lodash",
      "@mock-api": "/src/@mock-api",
      "@schema": "/src/@schema",
      "app/store": "/src/app/store",
      "app/shared-components": "/src/app/shared-components",
      "app/configs": "/src/app/configs",
      "app/theme-layouts": "/src/app/theme-layouts",
      "app/AppContext": "/src/app/AppContext"
    }
  },
  "optimizeDeps": {
    "include": ["@mui/icons-material", "@mui/material", "@mui/base", "@mui/styles", "@mui/system", "@mui/utils", "@emotion/cache", "@emotion/react", "@emotion/styled", "lodash"],
    "exclude": [],
    "esbuildOptions": {
      "loader": {
        ".js": "jsx"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL21lZGlhL3NyZWVqYS9IZGQvRG9jdW1lbnRzL0VuZmluL1Byb2plY3RzL0NJL0NJRnJvbnRFbmQvYWdlbmRhTW9kdWxlL2NpX2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvbWVkaWEvc3JlZWphL0hkZC9Eb2N1bWVudHMvRW5maW4vUHJvamVjdHMvQ0kvQ0lGcm9udEVuZC9hZ2VuZGFNb2R1bGUvY2lfZnJvbnRlbmQvdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9tZWRpYS9zcmVlamEvSGRkL0RvY3VtZW50cy9FbmZpbi9Qcm9qZWN0cy9DSS9DSUZyb250RW5kL2FnZW5kYU1vZHVsZS9jaV9mcm9udGVuZC92aXRlLmNvbmZpZy5tdHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgc3ZnclBsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1zdmdyJztcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRwbHVnaW5zOiBbXG5cdFx0cmVhY3Qoe1xuXHRcdFx0anN4SW1wb3J0U291cmNlOiAnQGVtb3Rpb24vcmVhY3QnLFxuXHRcdH0pLFxuXHRcdHRzY29uZmlnUGF0aHMoe1xuXHRcdFx0cGFyc2VOYXRpdmU6IGZhbHNlLFxuXHRcdH0pLFxuXHRcdHN2Z3JQbHVnaW4oKSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnY3VzdG9tLWhtci1jb250cm9sJyxcblx0XHRcdGhhbmRsZUhvdFVwZGF0ZSh7IGZpbGUsIHNlcnZlciB9KSB7XG5cdFx0XHRcdGlmIChmaWxlLmluY2x1ZGVzKCdzcmMvYXBwL2NvbmZpZ3MvJykpIHtcblx0XHRcdFx0XHRzZXJ2ZXIud3Muc2VuZCh7XG5cdFx0XHRcdFx0XHR0eXBlOiAnZnVsbC1yZWxvYWQnLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHJldHVybiBbXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9LFxuXHRcdH0sXG5cdF0sXG5cdGJ1aWxkOiB7XG5cdFx0b3V0RGlyOiAnYnVpbGQnLFxuXHRcdHJvbGx1cE9wdGlvbnM6IHtcblx0XHRcdG9ud2Fybih3YXJuaW5nLCB3YXJuKSB7XG5cdFx0XHRcdC8vIHNraXAgY2VydGFpbiB3YXJuaW5nc1xuXHRcdFx0XHRpZiAod2FybmluZy5jb2RlID09PSAnVU5TVVBQT1JURURfQ1NTX1BST1BFUlRZJykgcmV0dXJuO1xuXHRcdFx0XHQvLyBVc2UgZGVmYXVsdCBmb3IgZXZlcnl0aGluZyBlbHNlXG5cdFx0XHRcdHdhcm4od2FybmluZyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR0YXJnZXQ6ICdlc25leHQnLCAvLyBvciBzcGVjaWZ5IHRoZSBicm93c2VycyB5b3UgYXJlIHRhcmdldGluZ1xuXHR9LFxuXHRlc2J1aWxkOiB7XG5cdFx0dGFyZ2V0OiAnZXNuZXh0JywgLy8gRW5zdXJlIGVzYnVpbGQgdGFyZ2V0cyBhbiBlbnZpcm9ubWVudCB0aGF0IHN1cHBvcnRzIHRvcC1sZXZlbCBhd2FpdFxuXHR9LFxuXHRzZXJ2ZXI6IHtcblx0XHRvcGVuOiB0cnVlLFxuXHRcdHBvcnQ6IDMwMDBcblx0fSxcblx0ZGVmaW5lOiB7XG5cdFx0Z2xvYmFsOiAnd2luZG93Jyxcblx0fSxcblx0cmVzb2x2ZToge1xuXHRcdGFsaWFzOiB7XG5cdFx0XHQnQCc6ICcvc3JjJyxcblx0XHRcdFwiQGZ1c2VcIjogXCIvc3JjL0BmdXNlXCIsXG5cdFx0XHRcIkBoaXN0b3J5XCI6IFwiL3NyYy9AaGlzdG9yeVwiLFxuXHRcdFx0XCJAbG9kYXNoXCI6IFwiL3NyYy9AbG9kYXNoXCIsXG5cdFx0XHRcIkBtb2NrLWFwaVwiOiBcIi9zcmMvQG1vY2stYXBpXCIsXG5cdFx0XHRcIkBzY2hlbWFcIjogXCIvc3JjL0BzY2hlbWFcIixcblx0XHRcdFwiYXBwL3N0b3JlXCI6IFwiL3NyYy9hcHAvc3RvcmVcIixcblx0XHRcdFwiYXBwL3NoYXJlZC1jb21wb25lbnRzXCI6IFwiL3NyYy9hcHAvc2hhcmVkLWNvbXBvbmVudHNcIixcblx0XHRcdFwiYXBwL2NvbmZpZ3NcIjogXCIvc3JjL2FwcC9jb25maWdzXCIsXG5cdFx0XHRcImFwcC90aGVtZS1sYXlvdXRzXCI6IFwiL3NyYy9hcHAvdGhlbWUtbGF5b3V0c1wiLFxuXHRcdFx0XCJhcHAvQXBwQ29udGV4dFwiOiBcIi9zcmMvYXBwL0FwcENvbnRleHRcIlxuXHRcdH0sXG5cdH0sXG5cdFwib3B0aW1pemVEZXBzXCI6IHtcblx0XHRcImluY2x1ZGVcIjogWydAbXVpL2ljb25zLW1hdGVyaWFsJywgJ0BtdWkvbWF0ZXJpYWwnLCAnQG11aS9iYXNlJywgJ0BtdWkvc3R5bGVzJywgJ0BtdWkvc3lzdGVtJywgJ0BtdWkvdXRpbHMnLCAnQGVtb3Rpb24vY2FjaGUnLCAnQGVtb3Rpb24vcmVhY3QnLCAnQGVtb3Rpb24vc3R5bGVkJywgJ2xvZGFzaCddLFxuXHRcdFwiZXhjbHVkZVwiOiBbXSxcblx0XHRcImVzYnVpbGRPcHRpb25zXCI6IHtcblx0XHRcdFwibG9hZGVyXCI6IHtcblx0XHRcdFx0XCIuanNcIjogXCJqc3hcIixcblx0XHRcdH0sXG5cdFx0fSxcblx0fVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVhLFNBQVMsb0JBQW9CO0FBQ3BjLE9BQU8sV0FBVztBQUNsQixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLG1CQUFtQjtBQUcxQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixTQUFTO0FBQUEsSUFDUixNQUFNO0FBQUEsTUFDTCxpQkFBaUI7QUFBQSxJQUNsQixDQUFDO0FBQUEsSUFDRCxjQUFjO0FBQUEsTUFDYixhQUFhO0FBQUEsSUFDZCxDQUFDO0FBQUEsSUFDRCxXQUFXO0FBQUEsSUFDWDtBQUFBLE1BQ0MsTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLEVBQUUsTUFBTSxPQUFPLEdBQUc7QUFDakMsWUFBSSxLQUFLLFNBQVMsa0JBQWtCLEdBQUc7QUFDdEMsaUJBQU8sR0FBRyxLQUFLO0FBQUEsWUFDZCxNQUFNO0FBQUEsVUFDUCxDQUFDO0FBQ0QsaUJBQU8sQ0FBQztBQUFBLFFBQ1Q7QUFDQTtBQUFBLE1BQ0Q7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2QsT0FBTyxTQUFTLE1BQU07QUFFckIsWUFBSSxRQUFRLFNBQVM7QUFBNEI7QUFFakQsYUFBSyxPQUFPO0FBQUEsTUFDYjtBQUFBLElBQ0Q7QUFBQSxJQUNBLFFBQVE7QUFBQTtBQUFBLEVBQ1Q7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLFFBQVE7QUFBQTtBQUFBLEVBQ1Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNQO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDUCxRQUFRO0FBQUEsRUFDVDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsT0FBTztBQUFBLE1BQ04sS0FBSztBQUFBLE1BQ0wsU0FBUztBQUFBLE1BQ1QsWUFBWTtBQUFBLE1BQ1osV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IsV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IseUJBQXlCO0FBQUEsTUFDekIsZUFBZTtBQUFBLE1BQ2YscUJBQXFCO0FBQUEsTUFDckIsa0JBQWtCO0FBQUEsSUFDbkI7QUFBQSxFQUNEO0FBQUEsRUFDQSxnQkFBZ0I7QUFBQSxJQUNmLFdBQVcsQ0FBQyx1QkFBdUIsaUJBQWlCLGFBQWEsZUFBZSxlQUFlLGNBQWMsa0JBQWtCLGtCQUFrQixtQkFBbUIsUUFBUTtBQUFBLElBQzVLLFdBQVcsQ0FBQztBQUFBLElBQ1osa0JBQWtCO0FBQUEsTUFDakIsVUFBVTtBQUFBLFFBQ1QsT0FBTztBQUFBLE1BQ1I7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
