// vite.config.mts
import { defineConfig } from "file:///home/enfin-dev/Documents/Enfin%20Projects/ci_frontend/node_modules/vite/dist/node/index.js";
import react from "file:///home/enfin-dev/Documents/Enfin%20Projects/ci_frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import svgrPlugin from "file:///home/enfin-dev/Documents/Enfin%20Projects/ci_frontend/node_modules/vite-plugin-svgr/dist/index.js";
import tsconfigPaths from "file:///home/enfin-dev/Documents/Enfin%20Projects/ci_frontend/node_modules/vite-tsconfig-paths/dist/index.mjs";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvZW5maW4tZGV2L0RvY3VtZW50cy9FbmZpbiBQcm9qZWN0cy9jaV9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvZW5maW4tZGV2L0RvY3VtZW50cy9FbmZpbiBQcm9qZWN0cy9jaV9mcm9udGVuZC92aXRlLmNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvZW5maW4tZGV2L0RvY3VtZW50cy9FbmZpbiUyMFByb2plY3RzL2NpX2Zyb250ZW5kL3ZpdGUuY29uZmlnLm10c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCBzdmdyUGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLXN2Z3InO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocydcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG5cdHBsdWdpbnM6IFtcblx0XHRyZWFjdCh7XG5cdFx0XHRqc3hJbXBvcnRTb3VyY2U6ICdAZW1vdGlvbi9yZWFjdCcsXG5cdFx0fSksXG5cdFx0dHNjb25maWdQYXRocyh7XG5cdFx0XHRwYXJzZU5hdGl2ZTogZmFsc2UsXG5cdFx0fSksXG5cdFx0c3ZnclBsdWdpbigpLFxuXHRcdHtcblx0XHRcdG5hbWU6ICdjdXN0b20taG1yLWNvbnRyb2wnLFxuXHRcdFx0aGFuZGxlSG90VXBkYXRlKHsgZmlsZSwgc2VydmVyIH0pIHtcblx0XHRcdFx0aWYgKGZpbGUuaW5jbHVkZXMoJ3NyYy9hcHAvY29uZmlncy8nKSkge1xuXHRcdFx0XHRcdHNlcnZlci53cy5zZW5kKHtcblx0XHRcdFx0XHRcdHR5cGU6ICdmdWxsLXJlbG9hZCcsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cmV0dXJuIFtdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH0sXG5cdFx0fSxcblx0XSxcblx0YnVpbGQ6IHtcblx0XHRvdXREaXI6ICdidWlsZCcsXG5cdFx0cm9sbHVwT3B0aW9uczoge1xuXHRcdFx0b253YXJuKHdhcm5pbmcsIHdhcm4pIHtcblx0XHRcdFx0Ly8gc2tpcCBjZXJ0YWluIHdhcm5pbmdzXG5cdFx0XHRcdGlmICh3YXJuaW5nLmNvZGUgPT09ICdVTlNVUFBPUlRFRF9DU1NfUFJPUEVSVFknKSByZXR1cm47XG5cdFx0XHRcdC8vIFVzZSBkZWZhdWx0IGZvciBldmVyeXRoaW5nIGVsc2Vcblx0XHRcdFx0d2Fybih3YXJuaW5nKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHRhcmdldDogJ2VzbmV4dCcsIC8vIG9yIHNwZWNpZnkgdGhlIGJyb3dzZXJzIHlvdSBhcmUgdGFyZ2V0aW5nXG5cdH0sXG5cdGVzYnVpbGQ6IHtcblx0XHR0YXJnZXQ6ICdlc25leHQnLCAvLyBFbnN1cmUgZXNidWlsZCB0YXJnZXRzIGFuIGVudmlyb25tZW50IHRoYXQgc3VwcG9ydHMgdG9wLWxldmVsIGF3YWl0XG5cdH0sXG5cdHNlcnZlcjoge1xuXHRcdG9wZW46IHRydWUsXG5cdFx0cG9ydDogMzAwMFxuXHR9LFxuXHRkZWZpbmU6IHtcblx0XHRnbG9iYWw6ICd3aW5kb3cnLFxuXHR9LFxuXHRyZXNvbHZlOiB7XG5cdFx0YWxpYXM6IHtcblx0XHRcdCdAJzogJy9zcmMnLFxuXHRcdFx0XCJAZnVzZVwiOiBcIi9zcmMvQGZ1c2VcIixcblx0XHRcdFwiQGhpc3RvcnlcIjogXCIvc3JjL0BoaXN0b3J5XCIsXG5cdFx0XHRcIkBsb2Rhc2hcIjogXCIvc3JjL0Bsb2Rhc2hcIixcblx0XHRcdFwiQG1vY2stYXBpXCI6IFwiL3NyYy9AbW9jay1hcGlcIixcblx0XHRcdFwiQHNjaGVtYVwiOiBcIi9zcmMvQHNjaGVtYVwiLFxuXHRcdFx0XCJhcHAvc3RvcmVcIjogXCIvc3JjL2FwcC9zdG9yZVwiLFxuXHRcdFx0XCJhcHAvc2hhcmVkLWNvbXBvbmVudHNcIjogXCIvc3JjL2FwcC9zaGFyZWQtY29tcG9uZW50c1wiLFxuXHRcdFx0XCJhcHAvY29uZmlnc1wiOiBcIi9zcmMvYXBwL2NvbmZpZ3NcIixcblx0XHRcdFwiYXBwL3RoZW1lLWxheW91dHNcIjogXCIvc3JjL2FwcC90aGVtZS1sYXlvdXRzXCIsXG5cdFx0XHRcImFwcC9BcHBDb250ZXh0XCI6IFwiL3NyYy9hcHAvQXBwQ29udGV4dFwiXG5cdFx0fSxcblx0fSxcblx0XCJvcHRpbWl6ZURlcHNcIjoge1xuXHRcdFwiaW5jbHVkZVwiOiBbJ0BtdWkvaWNvbnMtbWF0ZXJpYWwnLCAnQG11aS9tYXRlcmlhbCcsICdAbXVpL2Jhc2UnLCAnQG11aS9zdHlsZXMnLCAnQG11aS9zeXN0ZW0nLCAnQG11aS91dGlscycsICdAZW1vdGlvbi9jYWNoZScsICdAZW1vdGlvbi9yZWFjdCcsICdAZW1vdGlvbi9zdHlsZWQnLCAnbG9kYXNoJ10sXG5cdFx0XCJleGNsdWRlXCI6IFtdLFxuXHRcdFwiZXNidWlsZE9wdGlvbnNcIjoge1xuXHRcdFx0XCJsb2FkZXJcIjoge1xuXHRcdFx0XHRcIi5qc1wiOiBcImpzeFwiLFxuXHRcdFx0fSxcblx0XHR9LFxuXHR9XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1YsU0FBUyxvQkFBb0I7QUFDL1csT0FBTyxXQUFXO0FBQ2xCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sbUJBQW1CO0FBRzFCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLFNBQVM7QUFBQSxJQUNSLE1BQU07QUFBQSxNQUNMLGlCQUFpQjtBQUFBLElBQ2xCLENBQUM7QUFBQSxJQUNELGNBQWM7QUFBQSxNQUNiLGFBQWE7QUFBQSxJQUNkLENBQUM7QUFBQSxJQUNELFdBQVc7QUFBQSxJQUNYO0FBQUEsTUFDQyxNQUFNO0FBQUEsTUFDTixnQkFBZ0IsRUFBRSxNQUFNLE9BQU8sR0FBRztBQUNqQyxZQUFJLEtBQUssU0FBUyxrQkFBa0IsR0FBRztBQUN0QyxpQkFBTyxHQUFHLEtBQUs7QUFBQSxZQUNkLE1BQU07QUFBQSxVQUNQLENBQUM7QUFDRCxpQkFBTyxDQUFDO0FBQUEsUUFDVDtBQUNBO0FBQUEsTUFDRDtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDZCxPQUFPLFNBQVMsTUFBTTtBQUVyQixZQUFJLFFBQVEsU0FBUztBQUE0QjtBQUVqRCxhQUFLLE9BQU87QUFBQSxNQUNiO0FBQUEsSUFDRDtBQUFBLElBQ0EsUUFBUTtBQUFBO0FBQUEsRUFDVDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsUUFBUTtBQUFBO0FBQUEsRUFDVDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1A7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNQLFFBQVE7QUFBQSxFQUNUO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUixPQUFPO0FBQUEsTUFDTixLQUFLO0FBQUEsTUFDTCxTQUFTO0FBQUEsTUFDVCxZQUFZO0FBQUEsTUFDWixXQUFXO0FBQUEsTUFDWCxhQUFhO0FBQUEsTUFDYixXQUFXO0FBQUEsTUFDWCxhQUFhO0FBQUEsTUFDYix5QkFBeUI7QUFBQSxNQUN6QixlQUFlO0FBQUEsTUFDZixxQkFBcUI7QUFBQSxNQUNyQixrQkFBa0I7QUFBQSxJQUNuQjtBQUFBLEVBQ0Q7QUFBQSxFQUNBLGdCQUFnQjtBQUFBLElBQ2YsV0FBVyxDQUFDLHVCQUF1QixpQkFBaUIsYUFBYSxlQUFlLGVBQWUsY0FBYyxrQkFBa0Isa0JBQWtCLG1CQUFtQixRQUFRO0FBQUEsSUFDNUssV0FBVyxDQUFDO0FBQUEsSUFDWixrQkFBa0I7QUFBQSxNQUNqQixVQUFVO0FBQUEsUUFDVCxPQUFPO0FBQUEsTUFDUjtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
