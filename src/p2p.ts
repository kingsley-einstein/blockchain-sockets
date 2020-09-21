import io from "socket.io";
import http from "http";
import { SocketActions } from "./actions";
import { NodeHandler, ChainHandler } from "./handlers";

export class P2P {
 _: io.Server;

 async initHandlers() {
  await NodeHandler.init();
  await ChainHandler.init();
 }

 async init(server: http.Server) {
  
  this._ = io(server);

  await this.initHandlers();

  this._.on("connect", async (client) => {
   this.clientBroadcast(client, SocketActions.NEW_NODE_JOINED, (await NodeHandler.addNode(client.id)));
   this.broadcastTo(client, SocketActions.GET_CHAIN, (await ChainHandler.getChain()));
  });
 }

 broadcast(event: SocketActions, data?: any) {
  return this._.emit(event, data);
 }

 private clientBroadcast(client: io.Socket, event: SocketActions, data?: any) {
  return client.broadcast.emit(event, data);
 }

 private broadcastTo(client: io.Socket, event: SocketActions, data?: any) {
  return this._.to(client.id).emit(event, data);
 }

 public getNodes() {
  return NodeHandler.getNodes();
 }
}
