import { Client, IMap, Config } from "hazelcast-client";
import { Block } from "../interfaces"
import crypto from "crypto-js";

export class Chain {
 static client: Client;
 static map: IMap<string, Block>;
 
 static async init() {
  this.client = await Client.newHazelcastClient();
  this.map = await this.client.getMap("chain");
 }

 private static async calculateHash(b: Block): Promise<Block> {
  b.hash = crypto.SHA256(b.index  + JSON.stringify(b.transaction) + b.timestamp + b.previousHash + b.nonce)
   .toString();

  return Promise.resolve(b);
 }

 private static async mineBlock(difficulty: number, b: Block): Promise<Block> {
  let block: Block = null;
  while(b.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
   b.nonce = b.nonce + 1;
   block = await this.calculateHash(b);
  }
  return block;
 }

 static async addBlock(difficulty: number, data: any): Promise<Block> {
  const allKeys = (await this.map.keySet())
  const block: Block = await this.calculateHash({
   index: (await this.map.get(allKeys[allKeys.length - 1])).index + 1,
   timestamp: new Date(Date.now()),
   previousHash: (await this.map.get(allKeys[allKeys.length - 1])).hash,
   nonce: 0,
   hash: "",
   transaction: data.transaction
  });
  const addedBlock = await this.mineBlock(difficulty, block);
  return Promise.resolve(addedBlock);
 }

 static async isChainValid(): Promise<boolean> {
  const all = (await this.map.entrySet());
  for (let i = 1; i < all.length; i++) {
   const [, currentBlock] = all[i];
   const [, previousBlock] = all[i -1];

   if (currentBlock.hash === (await this.calculateHash(currentBlock)).hash)
    return Promise.resolve(true);
   
   if (currentBlock.previousHash === previousBlock.hash)
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
 }
}
