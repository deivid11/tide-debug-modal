// src/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslintPlugin from "vite-plugin-eslint";

export default defineConfig({
    plugins: [
        react(),
        eslintPlugin({
            include: ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx"],
            cache: true, // Optional: Enable caching for better performance
            failOnError: false, // Optional: Don’t fail the build on ESLint errors
            emitWarning: true, // Ensure warnings are emitted
        }),
    ],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    server: {
        open:true
    },
});