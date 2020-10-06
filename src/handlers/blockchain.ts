import { Client, IMap } from "hazelcast-client";
import crypto from "crypto-js";
import { Block } from "../interfaces"
import { min } from "hazelcast-client/lib/aggregation/Aggregators";

export class ChainHandler {
 static client: Client;
 static map: IMap<string, Block>;
 
 static async init() {
  this.client = await Client.newHazelcastClient();
  this.map = await this.client.getMap("chain");

  const b = await this.calculateHash({
   hash: "",
   previousHash: "",
   timestamp: new Date(Date.now()),
   transaction: null,
   index: 1,
   nonce: 0
  });

  const genesisBlock = await this.createGenesisBlock(b);

  console.log({ ...genesisBlock });
 }

 private static async createGenesisBlock(b: Block): Promise<Block> {
  if ((await this.map.isEmpty())) {
   await this.map.put(b.hash, b, 0);
   return Promise.resolve(this.map.get(b.hash));
  }
  return Promise.resolve((
   await this.map.entrySet()
  ).map(([, block]) => block)[0]);
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
  const chain = (await this.map.entrySet())
   .map(([, b]) => b);
  const block: Block = await this.calculateHash({
   index: chain[chain.length - 1].index + 1,
   timestamp: new Date(Date.now()),
   previousHash: chain[chain.length - 1].hash,
   nonce: 0,
   hash: "",
   transaction: data.transaction
  });
  const minedBlock = await this.mineBlock(difficulty, block);

  await this.map.put(minedBlock.hash, minedBlock, 0);

  return Promise.resolve(this.map.get(minedBlock.hash));
 }

 static async isChainValid(): Promise<boolean> {
  const all = (await this.map.entrySet());
  for (let i = 1; i < all.length; i++) {
   const [, currentBlock] = all[i];
   const [, previousBlock] = all[i - 1];

   if (currentBlock.hash !== (await this.calculateHash(currentBlock)).hash)
    return Promise.resolve(false);
   
   if (currentBlock.previousHash !== previousBlock.hash)
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
 }

 static async getChain(): Promise<Array<Block>> {
  const all = await this.map.entrySet();
  return Promise.resolve(
   all.map(([, b]) => b)
  );
 }

 static async close() {
  await this.client.shutdown();
 }
}
