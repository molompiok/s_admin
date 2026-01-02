import { createTodoHandler } from "./create-todo-handler";
import { apply, serve } from "@photonjs/express";
import express from "express";
import { closeQueue, getServerQueue } from "../api/Scalling/bullmqClient.js";
import { LoadMonitorService } from "../api/Scalling/loadMonitorClient.js";
import logger from "../api/Logger.js";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3008;
const SERVICE_ID = process.env.SERVICE_ID;

export default startApp() as unknown;

async function startApp() {
  const app = express();

  app.get('/health', async (_req, res) => {
    res.status(200).json({ ok: true });
    return
  });

  apply(app, [createTodoHandler]);

  import { Server } from "http";

  // ...

  const server = (await serve(app, {
    port,
  })) as unknown as Server;

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
