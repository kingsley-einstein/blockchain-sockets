import express from "express";
import http from "http";
import debug from "debug";
import crypto from "crypto-js";
import { P2P } from "./p2p";
import config from "./config";
import { FS } from "./helpers";
import * as inmemory from "./cache";
import { Block } from "./interfaces";
// import { nodes } from "./middleware";

let app: express.Application = express();
const server: http.Server = http.createServer(app);
const p2p = new P2P(server);
const log = debug("app");
const port = parseInt(process.env.PORT || "4567");

const terminateOnExit = (client: any) => {
 process.on("exit", async () => {
  await client.shutdown();
 });
};

const writeFiles = () => {
 const b: Block = {
  index: 1,
  previousHash: "0000",
  timestamp: new Date(Date.now()),
  nonce: 0,
  transaction: {
   txFee: null,
   txHash: "",
   txId: "0000",
   txInputs: null,
   txOutputs: null,
   txStatus: "approved",
   txSignature: "0000"
  },
  hash: ""
 };

 const genesisBlock: Block = { ...b, hash: crypto.SHA256(b.index + "" + b.timestamp + b.previousHash + JSON.stringify(b.transaction) + b.nonce).toString()};
 
 if (!FS.fileExists("chain.data"))
  FS.fileWrite("chain.data", JSON.stringify({
   blocks: [genesisBlock]
  }));
 
 if (!FS.fileExists("wallets.data"))
  FS.fileWrite("wallets.data", JSON.stringify({
   wallets: []
  }));
 
 if (!FS.fileExists("transactions.data"))
  FS.fileWrite("transactions.data", JSON.stringify({
   transactions: []
  }));
};

app = config(app);

// app.use(nodes(p2p));

server.listen(port, async () => {
 log(`Server running on ${port}`);

 writeFiles();

 const c = await inmemory.sync();

 terminateOnExit(c);

 log(`-------+++++: ${c.getName()}`);
});

export { p2p, app };

