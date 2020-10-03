import express from "express";
import http from "http";
import debug from "debug";
import { P2P } from "./p2p";
import { nodes } from "./middleware";

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const p2p = new P2P(server);
const log = debug("app");
const port = parseInt(process.env.PORT || "4567");

app.use(nodes(p2p));

server.listen(port, () => {
 log(`Server running on ${port}`);
});

export { p2p, app };

