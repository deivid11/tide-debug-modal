// src/utils/viteLogStreamer.js
import { WebSocketServer } from 'ws';

export function viteLogStreamer() {
    return {
        name: 'vite-log-streamer',
        configureServer(server) {
            let port = 5174; // Start with 5174, distinct from Vite’s HMR
            let wss;

            const tryStartServer = (currentPort) => {
                wss = new WebSocketServer({ port: currentPort });

                wss.on('error', (err) => {
                    if (err.code === 'EADDRINUSE') {
                        console.log(`Port ${currentPort} is in use, trying ${currentPort + 1}...`);
                        wss.close();
                        tryStartServer(currentPort + 1);
                    }
                });

                wss.on('listening', () => {
                    console.log(`WebSocket server for logs running on ws://localhost:${currentPort}`);
                    // Store the port somewhere accessible if needed (e.g., server.config)
                    server.config.viteLogStreamerPort = currentPort;
                });

                // Capture console output
                const originalLog = console.log;
                const originalError = console.error;

                console.log = (...args) => {
                    const message = args.join(' ').trim();
                    if (message) {
                        const formattedMessage = `[log] ${message}`;
                        wss.clients.forEach((client) => {
                            if (client.readyState === 1) {
                                client.send(formattedMessage);
                            }
                        });
                        originalLog.apply(console, args);
                    }
                };

                console.error = (...args) => {
                    const message = args.join(' ').trim();
                    if (message) {
                        const formattedMessage = `[error] ${message}`;
                        wss.clients.forEach((client) => {
                            if (client.readyState === 1) {
                                client.send(formattedMessage);
                            }
                        });
                        originalError.apply(console, args);
                    }
                };

                const originalLoggerWarn = server.config.logger.warn;
                const originalLoggerError = server.config.logger.error;

                server.config.logger.warn = (...args) => {
                    const message = args.join(' ').trim();
                    if (message) {
                        const formattedMessage = `[WARN] ${message}`;
                        wss.clients.forEach((client) => {
                            if (client.readyState === 1) {
                                client.send(formattedMessage);
                            }
                        });
                    }
                    originalLoggerWarn.apply(server.config.logger, args);
                };

                server.config.logger.error = (...args) => {
                    const message = args.join(' ').trim();
                    if (message) {
                        const formattedMessage = `[ERROR] ${message}`;
                        wss.clients.forEach((client) => {
                            if (client.readyState === 1) {
                                client.send(formattedMessage);
                            }
                        });
                    };
                    originalLoggerError.apply(server.config.logger, args);
                };

                server.httpServer.on('close', () => {
                    wss.close();
                });
            };

            tryStartServer(port);
        },
    };
}