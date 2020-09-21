import express from "express";
import http from "http";
import { P2P } from "./p2p";
import { nodes } from "./middleware";

const app: express.Application = express();
const p2p = new P2P();

app.use(nodes(p2p));

const server: http.Server = http.createServer(app);

server.listen(4567, async () => {
 await p2p.init(server);
});

export { p2p, app };

