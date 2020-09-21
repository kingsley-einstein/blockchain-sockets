import io from "socket.io";
import http from "http";
import { NodeHandler, Chain } from "./handlers";

enum SocketActions {
 NODE_JOINED = "NODE_JOINED",
 NODE_LEFT = "NODE_LEFT",
 NEW_BLOCK_MINED = "NEW_BLOCK_MINED",
 NEW_TRANSACTION_ADDED = "NEW_TRANSACTION_ADDED",
 GET_CHAIN = "GET_CHAIN"
}

export class P2P {
 _: io.Server;
 constructor(s: http.Server) {
  this._ = io(s);
 }

 async init() {
  await NodeHandler.init();
  await Chain.init();
  this._.on("connect", async (client) => {
   this.clientBroadcast(client, SocketActions.NODE_JOINED, (await NodeHandler.addNode(client.id)));
   this.singleBroadcast(client, SocketActions.GET_CHAIN, (await Chain.getChain()));
   client.on("leave", async () => {
    await NodeHandler.removeNode(client.id);
    client.disconnect(true);
    this.broadcast(SocketActions.NODE_LEFT, {});
   });
   client.on("add_block", data => {});
  });
 }

 private broadcast(event: SocketActions, data: any) {
  return this._.emit(event, data);
 }

 private singleBroadcast(client: io.Socket, event: SocketActions, data?: any) {
  return this._.to(client.id).emit(event, data);
 }

 private clientBroadcast(client: io.Socket, event: SocketActions, data?: any) {
  return client.broadcast.emit(event, data);
 }
}
