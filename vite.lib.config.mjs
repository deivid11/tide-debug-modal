// vite.lib.config.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.js'),
            name: 'TideDebugModal',
            fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
            formats: ['es', 'umd'],
        },
        rollupOptions: {
            // Externalize all React-related modules
            external: [
                'react',
                'react-dom',
                'react-json-view',
                'react/jsx-runtime',
                'react/jsx-dev-runtime',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react-json-view': 'ReactJson',
                    'react/jsx-runtime': 'ReactJSXRuntime',
                },
            },
        },
        sourcemap: true,
        minify: false,
    },
    resolve: {
        dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    },
});