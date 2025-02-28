import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/components/TideDebugModal.jsx'),
            name: 'ReactDevDebugModal',
            fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react-json-view', 'ws'], // Exclude ws from the bundle
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react-json-view': 'ReactJson',
                    'ws': 'WebSocketServer', // Not needed at runtime, but included for completeness
                },
            },
        },
    },
});