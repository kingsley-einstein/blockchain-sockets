import { Client, IMap } from "hazelcast-client";
import crypto from "crypto-js";
import { FS } from "../helpers";
import { Transaction, Wallet } from "../interfaces";

const txsFile = "transactions.data";

export class TransactionHandler {
 map: IMap<string, Transaction>;

 async define(c: Client) {
  this.map = await c.getMap("transactions");
 }

 private calculateTxHash(tx: Transaction): Promise<Transaction> {
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

 private async signTx(tx: Transaction, w: Wallet): Promise<Transaction> {
  tx.txSignature = crypto.SHA256(JSON.stringify(tx.txInputs) + JSON.stringify(tx.txOutputs) + tx.txStatus + tx.txHash + w.privateKey)
   .toString();

  return Promise.resolve(tx);
 }

 async createTx(tx: Transaction): Promise<Transaction> {
  const t: Transaction = await this.calculateTxHash({ ...tx, txSignature: null });
  
  await this.map.put(t.txId, t, 0);

  let txsFromFile: Array<Transaction> = JSON.parse((<string> FS.fileRead(txsFile)));

  const t2: Transaction = await this.map.get(t.txId);

  txsFromFile = [...txsFromFile, t2];

  FS.fileWrite(txsFile, JSON.stringify(txsFromFile));
  
  return Promise.resolve(t2);
 }

 async getTx(txId: string): Promise<Transaction> {
  const txsFromFile: Array<Transaction> = JSON.parse((<string> FS.fileRead(txsFile)));

  for (const tx of txsFromFile)
   await this.map.put(tx.txId, tx, 0);
  
  return Promise.resolve(
   this.map.get(txId)
  );
 }

 async getPendingTxs(): Promise<Array<Transaction>> {
  const txsFromFile: Array<Transaction> = JSON.parse((<string> FS.fileRead(txsFile)));
  
  for (const tx of txsFromFile)
   await this.map.put(tx.txId, tx, 0);
  
   const pendingTxs = (await this.map.entrySet())
   .map(([, tx]) => tx)
   .filter((tx) => tx.txStatus === "pending");

  return Promise.resolve(pendingTxs);
 }

 async getDeclinedTxs(): Promise<Array<Transaction>> {
  const txsFromFile: Array<Transaction> = JSON.parse((<string> FS.fileRead(txsFile)));
  
  for (const tx of txsFromFile)
   await this.map.put(tx.txId, tx, 0);
  
  const declinedTxs = (await this.map.entrySet())
   .map(([, tx]) => tx)
   .filter((tx) => tx.txStatus === "declined");

  return Promise.resolve(declinedTxs);
 }

 async getAcceptedTxs(): Promise<Array<Transaction>> {
  const txsFromFile: Array<Transaction> = JSON.parse((<string> FS.fileRead(txsFile)));
  
  for (const tx of txsFromFile)
   await this.map.put(tx.txId, tx, 0);
  
  const acceptedTxs = (await this.map.entrySet())
   .map(([, tx]) => tx)
   .filter((tx) => tx.txStatus === "approved");

  return Promise.resolve(acceptedTxs);
 }

 async getAllTxs(): Promise<Array<Transaction>> {
  const txsFromFile: Array<Transaction> = JSON.parse((<string> FS.fileRead(txsFile)));
  
  for (const tx of txsFromFile)
   await this.map.put(tx.txId, tx, 0);
  
  const allTxs = (await this.map.entrySet())
   .map(([, tx]) => tx);

  return Promise.resolve(allTxs);
 }

 async approveTx(tx: Transaction, w: Wallet): Promise<Transaction> {
  let txsFromFile: Array<Transaction> = JSON.parse((<string> FS.fileRead(txsFile)));

  for (const tx of txsFromFile)
   await this.map.put(tx.txId, tx, 0);
  
  tx.txStatus = "approved";
  const tx1 = await this.signTx(tx, w);
  const tx2: Transaction = await this.map.put(tx1.txId, tx1, 0);

  txsFromFile = txsFromFile.filter((t) => t.txId !== tx.txId);
  txsFromFile = [...txsFromFile, tx2];

  FS.fileWrite(txsFile, JSON.stringify(txsFile));

  return Promise.resolve(this.map.get(tx2.txId));
 }

 async getAllTxsByInputAddress(address: string): Promise<Array<Transaction>> {
  const txsFromFile: Array<Transaction> = JSON.parse((<string> FS.fileRead(txsFile)));

  for (const tx of txsFromFile)
   await this.map.put(tx.txId, tx, 0);
  
  const allTxsByAddress = (await this.map.entrySet())
   .map(([, tx]) => tx)
   .filter((tx) => {
    return tx.txInputs.some((i) => i.address === address);
   });

  return Promise.resolve(allTxsByAddress);
 }

 async getAllTxsByOutputAddress(address: string): Promise<Array<Transaction>> {
  const txsFromFile: Array<Transaction> = JSON.parse((<string> FS.fileRead(txsFile)));

  for (const tx of txsFromFile)
   await this.map.put(tx.txId, tx, 0);
  
  const allTxsByAddress = (await this.map.entrySet())
   .map(([, tx]) => tx)
   .filter((tx) => {
    return tx.txOutputs.some((o) => o.address === address);
   });

  return Promise.resolve(allTxsByAddress);
 }
}
