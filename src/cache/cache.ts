import { Client } from "hazelcast-client";
import { BChainHandler, WalletHandler, TransactionHandler } from "../handlers";

export const BlockChain = new BChainHandler();
export const Wallet = new WalletHandler();
export const TX = new TransactionHandler();

export const sync = async () => {
 const client = await Client.newHazelcastClient();
 
 await BlockChain.define(client);
 await Wallet.define(client);
 await TX.define(client);

 process.on("beforeExit", async () => {
  await client.shutdown();
 });

 return client;
};
