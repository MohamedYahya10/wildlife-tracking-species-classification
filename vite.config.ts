import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { handleApiRoute } from './server/detectEndpoints';
import { handleIdentifyRequest } from './server/identifyHandler';
import { getDatabaseRecords, saveDatabaseRecord, clearDatabaseRecords } from './server/dbHandler';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'wildlife-api-middleware',
        configureServer(server) {
          // Comprehensive Wildlife Detection & 40-Species Database API
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/')) {
              try {
                const handled = await handleApiRoute(req, res);
                if (handled) return;
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err?.message || 'Server error' }));
                return;
              }
            }
            next();
          });

          // Continuous Wildlife Identification API (legacy endpoint)
          server.middlewares.use('/api/identify', (req, res, next) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const parsed = body ? JSON.parse(body) : {};
                  const result = await handleIdentifyRequest(parsed);
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(result));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err?.message || 'Identification failed' }));
                }
              });
            } else {
              next();
            }
          });

          // Persistent Detection Records Database API
          server.middlewares.use('/api/database', (req, res, next) => {
            if (req.method === 'GET') {
              try {
                const records = getDatabaseRecords();
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  success: true, 
                  count: records.length, 
                  records 
                }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err?.message }));
              }
            } else if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const parsed = body ? JSON.parse(body) : {};
                  const saved = saveDatabaseRecord(parsed);
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(saved));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: err?.message }));
                }
              });
            } else if (req.method === 'DELETE') {
              try {
                const result = clearDatabaseRecords();
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err?.message }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
