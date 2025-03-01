// vite.utils.config.mjs - A separate build config just for utilities
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    // No React plugin needed for utils
    build: {
        outDir: 'dist/utils',
        lib: {
            entry: path.resolve(__dirname, 'src/utils/viteLogStreamer.js'),
            name: 'viteLogStreamer',
            fileName: () => 'viteLogStreamer.js',
            formats: ['es'], // Only use ES modules for utils to avoid UMD issues
        },
        rollupOptions: {
            external: ['ws'],
            output: {
                // Make sure paths are correctly maintained
                preserveModules: false,
            }
        },
        sourcemap: true,
        minify: false,
    },
});