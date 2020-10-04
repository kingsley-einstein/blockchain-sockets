import express from "express";
import debug from "debug";

const log = debug("requests");

export const logger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
 res.on("finish", () => log(`Status: ${res.statusCode} \n Path: ${req.path} \n Method: ${req.method}`));
 next();
};
