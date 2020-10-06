import { Client, IMap } from "hazelcast-client";
import crypto from "crypto-js";
import { Transaction, Wallet } from "../interfaces";

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

 private static async signTx(tx: Transaction, w: Wallet): Promise<Transaction> {
  tx.txSignature = crypto.SHA256(JSON.stringify(tx.txInputs) + JSON.stringify(tx.txOutputs) + tx.txStatus + tx.txHash + w.privateKey)
   .toString();

  return Promise.resolve(tx);
 }

 static async createTx(tx: Transaction): Promise<Transaction> {
  const t: Transaction = await this.calculateTxHash({ ...tx, txSignature: null });
  
  await this.map.put(t.txId, t, 0);

  const t2: Transaction = await this.map.get(t.txId);
  
  return Promise.resolve(t2);
 }

 static async getTx(txId: string): Promise<Transaction> {
  return Promise.resolve(
   this.map.get(txId)
  );
 }

 static async getPendingTxs(): Promise<Array<Transaction>> {
  const pendingTxs = (await this.map.entrySet())
   .map(([, tx]) => tx)
   .filter((tx) => tx.txStatus === "pending");

  return Promise.resolve(pendingTxs);
 }

 static async getDeclinedTxs(): Promise<Array<Transaction>> {
  const declinedTxs = (await this.map.entrySet())
   .map(([, tx]) => tx)
   .filter((tx) => tx.txStatus === "declined");

  return Promise.resolve(declinedTxs);
 }

 static async getAcceptedTxs(): Promise<Array<Transaction>> {
  const acceptedTxs = (await this.map.entrySet())
   .map(([, tx]) => tx)
   .filter((tx) => tx.txStatus === "approved");

  return Promise.resolve(acceptedTxs);
 }

 static async getAllTxs(): Promise<Array<Transaction>> {
  const allTxs = (await this.map.entrySet())
   .map(([, tx]) => tx);

  return Promise.resolve(allTxs);
 }

 static async approveTx(tx: Transaction, w: Wallet): Promise<Transaction> {
  tx.txStatus = "approved";
  const tx1 = await this.signTx(tx, w);
  const tx2: Transaction = await this.map.put(tx1.txId, tx1, 0);

  return Promise.resolve(this.map.get(tx2.txId));
 }

 static async getAllTxsByInputAddress(address: string): Promise<Array<Transaction>> {
  const allTxsByAddress = (await this.map.entrySet())
   .map(([, tx]) => tx)
   .filter((tx) => {
    return tx.txInputs.some((i) => i.address === address);
   });

  return Promise.resolve(allTxsByAddress);
 }

 static async getAllTxsByOutputAddress(address: string): Promise<Array<Transaction>> {
  const allTxsByAddress = (await this.map.entrySet())
   .map(([, tx]) => tx)
   .filter((tx) => {
    return tx.txOutputs.some((o) => o.address === address);
   });

  return Promise.resolve(allTxsByAddress);
 }

 static async close() {
  await this.client.shutdown();
 }
}
