import express from "express";
import router from "../router";
import { logger } from "../middleware";

export default (app: express.Application) => {
 app.use(express.json());
 app.use(express.urlencoded({
  extended: false
 }));
 app.use(logger);
 app.use("/api/v1", router);
 
 return app;
};
