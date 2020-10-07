import express from "express";
import http from "http";
import debug from "debug";
import { P2P } from "./p2p";
import config from "./config";
import { FS } from "./helpers";
// import { nodes } from "./middleware";

let app: express.Application = express();
const server: http.Server = http.createServer(app);
const p2p = new P2P(server);
const log = debug("app");
const port = parseInt(process.env.PORT || "4567");

app = config(app);

// app.use(nodes(p2p));

server.listen(port, () => {
 log(`Server running on ${port}`);
 FS.fileWrite("block.data", {
  r: ["Abe Truro"]
 });
 console.log(FS.fileRead("block.data"));
});

export { p2p, app };

