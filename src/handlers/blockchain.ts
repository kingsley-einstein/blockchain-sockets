import { Client, IMap } from "hazelcast-client";
import crypto from "crypto-js";
import { Block } from "../interfaces"
import { FS } from "../helpers";

const chainFile = "chain.data";

export class BChainHandler {
 private map: IMap<string, Block>
 private difficulty: number = 0;

 async define(c: Client) {
  this.map = await c.getMap("chain");
 }

 private calculateHash(b: Block): Promise<Block> {
  const block: Block = {
   ...b, hash: crypto.SHA256(b.index + "" + b.timestamp + b.previousHash + JSON.stringify(b.transaction) + b.nonce).toString()
  };
  return Promise.resolve(block);
 }

 private async mineBlock(block: Block, difficulty: number): Promise<Block> {
  const chainFromFile: Array<Block> = (<any> FS.fileRead(chainFile)).blocks;

  for (const bc of chainFromFile)
   await this.map.put(bc.hash, bc, 0);
  
  const chain = (await this.map.entrySet())
   .map(([, bx]) => bx);

  // console.log(chain);
  
  let b: Block = { ...block, timestamp: new Date(Date.now()) };
  this.difficulty = difficulty;
  // console.log(this.difficulty);

  // const diff = (new Date(chain[chain.length - 1].timestamp).getSeconds() - b.timestamp.getSeconds());

  // if (diff <= 20) {
  //  this.difficulty = this.difficulty + 4;
  // } else {
  //  this.difficulty = this.difficulty + 2;
  // }

  while(b.hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join("0")) {
   b.nonce = b.nonce + 1;
   b.timestamp = new Date(Date.now());
   b = await this.calculateHash(b);   
  }
  return Promise.resolve(b); 
 }

 async addBlock(b: Block): Promise<Block> {
  let chainFromFile: Array<Block> = (<any> FS.fileRead(chainFile)).blocks;

  for (const block0 of chainFromFile)
   await this.map.put(block0.hash, block0, 0);

  const chain = (await this.map.entrySet())
   .map(([, bx]) => bx);

   const block1 = await this.calculateHash({
    ...b,
    index: chain[chain.length - 1].index + 1,
    previousHash: chain[chain.length - 1].hash
   });

  const block2 = await this.mineBlock(block1, Math.floor(Math.random() * 5));

  chainFromFile = [...chainFromFile, block2];

  FS.fileWrite(chainFile, JSON.stringify({
   blocks: chainFromFile
  }));

  for (const block0 of chainFromFile)
   await this.map.put(block0.hash, block0, 0);

  return Promise.resolve(
   this.map.get(block2.hash)
  );
 }

 async getChain(): Promise<Array<Block>> {
  const chainFromFile: Array<Block> = (<any> FS.fileRead(chainFile)).blocks;

  for (const block of chainFromFile)
   await this.map.put(block.hash, block, 0);

  return Promise.resolve(
   (await this.map.entrySet())
    .map(([, block]) => block)
  );
 }
}
