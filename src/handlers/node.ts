import { Client, IMap } from "hazelcast-client";
import { Node } from "../interfaces";

export class NodeHandler {
 static client: Client;
 static map: IMap<string, Node>;

 static async init() {
  this.client = await Client.newHazelcastClient();
  this.map = await this.client.getMap("nodes");
 }

 static async addNode(id: string): Promise<Node> {
  const node = await this.map.put(id, { id });
  return Promise.resolve(node);
 }

 static async removeNode(id: string): Promise<void> {
  await this.map.delete(id);
 }
}
