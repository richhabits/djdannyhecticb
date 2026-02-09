
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './client/src'),
            '@client': path.resolve(__dirname, './client/src'),
            '@shared': path.resolve(__dirname, './shared'),
        },
    },
    root: path.resolve(__dirname, './client'),
    publicDir: path.resolve(__dirname, './public'),
    build: {
        outDir: path.resolve(__dirname, './dist/public'),
        emptyOutDir: true,
    },
    // When running web-only, we proxy API requests to nowhere or a mock server
    // But since we are crashing on DB, we just want UI to load.
    server: {
        port: 3000,
        open: true,
    }
});
