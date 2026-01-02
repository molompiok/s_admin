import { createTodoHandler } from "./create-todo-handler";
import { apply } from "@photonjs/express";
import express from "express";
import { closeQueue, getServerQueue } from "../api/Scalling/bullmqClient.js";
import { LoadMonitorService } from "../api/Scalling/loadMonitorClient.js";
import logger from "../api/Logger.js";
import compression from 'compression';
import { renderPage, createDevMiddleware } from 'vike/server';
import { localDir, root } from './root.js';

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3008;
const SERVICE_ID = process.env.SERVICE_ID;

export default startApp() as unknown;

async function startApp() {
  const app = express();

  app.use(compression());

  // Vite integration
  if (isProduction) {
    const sirv = (await import('sirv')).default;
    app.use(sirv(`${root}/dist/client`));
  } else {
    const { devMiddleware } = await createDevMiddleware({ root });
    app.use(devMiddleware);
  }

  app.get('/health', async (_req, res) => {
    res.status(200).json({ ok: true });
    return
  });

  apply(app, [createTodoHandler]);

  // Vike middleware
  app.get('*', async (req, res, next) => {
    const headersOriginal = req.headers as Record<string, string> || {};

    const serverUrlFromHeader = headersOriginal['x-server-url'] || 'http://sublymus-server.com';
    const serverApiFromHeader = headersOriginal['x-server-api-url'] || 'http://server.sublymus-server.com';

    const pageContextInit = {
      urlOriginal: req.originalUrl,
      headersOriginal: req.headers,
      serverUrl: serverUrlFromHeader,
      serverApiUrl: serverApiFromHeader,
    };

    const pageContext = await renderPage(pageContextInit);

    if (pageContext.errorWhileRendering) {
      // Install error tracking here
    }

    const { httpResponse } = pageContext;
    if (!httpResponse) {
      return next();
    }

    if (res.writeEarlyHints) res.writeEarlyHints({ link: httpResponse.earlyHints.map((e) => e.earlyHintLink) });
    httpResponse.headers.forEach(([name, value]) => res.setHeader(name, value));
    res.status(httpResponse.statusCode);
    res.send(httpResponse.body);
  });

  const server = app.listen(port);
  console.log(`Server running at http://localhost:${port}`);

  const loadMonitoring = new LoadMonitorService({
    bullmqQueue: getServerQueue(),
    logger: logger,
    serviceId: SERVICE_ID || 's_admin',
    serviceType: 'app',
  });

  loadMonitoring.startMonitoring()
  const shutdown = async () => {
    console.log(`[Admin Server ${SERVICE_ID}] Arrêt demandé...`);
    server.close(async () => {
      console.log(`[Admin Server ${SERVICE_ID}] Serveur HTTP fermé.`);
      await closeQueue(); // Fermer la connexion BullMQ/Redis
      process.exit(0);
    });
    // Forcer la fermeture après un délai si le serveur ne se ferme pas
    setTimeout(async () => {
      console.error(`[Admin Server ${SERVICE_ID}] Arrêt forcé après timeout.`);
      await closeQueue();
      process.exit(1);
    }, 10000); // 10 secondes timeout
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
}
