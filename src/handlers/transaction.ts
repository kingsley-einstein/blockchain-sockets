import { Client, IMap } from "hazelcast-client";
import crypto from "crypto-js";
import { Transaction } from "../interfaces";

export class TransactionHandler {
 static client: Client;
 static map: IMap<string, Transaction>;

 static async init() {
  this.client = await Client.newHazelcastClient();
  this.map = await this.client.getMap("transactions");
 }

 private static calculateTxHash(tx: Transaction): Promise<Transaction> {
  tx.txHash = crypto.SHA256(
   JSON.stringify(tx.txInputs) + 
   JSON.stringify(tx.txOutputs) + 
   JSON.stringify(tx.txFee) + 
   tx.txId + 
   tx.txStatus
  )
  .toString();

  return Promise.resolve(tx);
 }

 static async createTx(tx: Transaction): Promise<Transaction> {
  const t: Transaction = await this.calculateTxHash(tx);
  const t2: Transaction = await this.map.put(t.txId, t);
  
  return Promise.resolve(t2);
 }

 static async getPendingTxs(): Promise<Array<Transaction>> {
  const pendingTxs = (await this.map.entrySet())
   .map(([, tx]) => tx)
   .filter((tx) => tx.txStatus === "pending");

  return Promise.resolve(pendingTxs);
 }
}
