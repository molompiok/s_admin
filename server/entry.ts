import { createTodoHandler } from "./create-todo-handler";
import { apply, serve } from "@photonjs/express";
import express from "express";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3008;

export default startApp() as unknown;

function startApp() {
  const app = express();
  
  app.get('/health', async (_req, res) => {
    res.status(200).json({ok:true});
    return
  });
  
  apply(app, [createTodoHandler]);

  return serve(app, {
    port,
  });
}
