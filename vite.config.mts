import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react({
			jsxImportSource: '@emotion/react',
		}),
		tsconfigPaths({
			parseNative: false,
		}),
		svgrPlugin(),
		{
			name: 'custom-hmr-control',
			handleHotUpdate({ file, server }) {
				if (file.includes('src/app/configs/')) {
					server.ws.send({
						type: 'full-reload',
					});
					return [];
				}
				return;
			},
		},
	],
	build: {
		outDir: 'build',
		rollupOptions: {
			onwarn(warning, warn) {
				// skip certain warnings
				if (warning.code === 'UNSUPPORTED_CSS_PROPERTY') return;
				// Use default for everything else
				warn(warning);
			}
		},
		target: 'esnext', // or specify the browsers you are targeting
	},
	esbuild: {
		target: 'esnext', // Ensure esbuild targets an environment that supports top-level await
	},
	server: {
		open: true,
		port: 3000
	},
	define: {
		global: 'window',
	},
	resolve: {
		alias: {
			'@': '/src',
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
		},
	},
	"optimizeDeps": {
		"include": ['@mui/icons-material', '@mui/material', '@mui/base', '@mui/styles', '@mui/system', '@mui/utils', '@emotion/cache', '@emotion/react', '@emotion/styled', 'lodash'],
		"exclude": [],
		"esbuildOptions": {
			"loader": {
				".js": "jsx",
			},
		},
	}
});
