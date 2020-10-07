import { Client, IMap } from "hazelcast-client";
import crypto from "crypto-js";
import { Block } from "../interfaces"

export class BChainHandler {
 private chain: IMap<string, Block>

 async define(c: Client) {
  this.chain = await c.getMap("chain");
 }
}
