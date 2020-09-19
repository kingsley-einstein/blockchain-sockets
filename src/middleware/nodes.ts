import express from "express";
import debug from "debug";
import { P2P } from "../p2p";

const log = debug("middleware");

export default (p: P2P) => {
 return (req: express.Request & { nodes: Set<any> }, res: express.Response, next: express.NextFunction) => {
  log(`Nodes :----: ${JSON.stringify([...p.getNodes()])}`)
  req.nodes = p.getNodes();
  next();
 };
}
