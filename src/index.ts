import express from "express";
import http from "http";
import debug from "debug";
import nodes from "./middleware/nodes";
import { P2P } from "./p2p";

const app: express.Application = express();
const p2p = new P2P();
const log = debug("app");

app.use(express.json());
app.use(nodes(p2p));

app.get("/nodes", (req: any, res) => {
 return res.status(200).json({
  path: req.path,
  nodes: [...req.nodes]
 });
});

const server: http.Server = http.createServer(app);

p2p.init(server);

server.listen(3766, () => {
 log(`Peer-To-Peer server is running. Listening for nodes.`);
});
