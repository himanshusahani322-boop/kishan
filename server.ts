import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app } from './server/app';

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || '0.0.0.0';

  const server = http.createServer(app);

  // Vite middleware in development or static serve in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, HOST, () => {
    console.log(`\n  Kisan Saathi full-stack server running:`);
    console.log(`  - Local:   http://localhost:${PORT}/`);
    console.log(`  - Network: http://127.0.0.1:${PORT}/\n`);
  });

  server.on('error', (err) => {
    console.error('Server listen error:', err);
  });

  server.on('close', () => {
    console.log('Server closed');
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}

startServer().catch((err) => {
  console.error('Fatal startServer error:', err);
});
