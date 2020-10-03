import io from "socket.io";
import http from "http";
import debug from "debug";
import { v4 as uuid } from "uuid";
import { SocketActions } from "./actions";
import { ChainHandler } from "./handlers";

const log = debug("p2p");

export class P2P {
 s: io.Server;
 constructor(server: http.Server) {
  this.s = io(server);
  this.listen();
 }

 private listen() {
  this.s.on("connect", async (socket) => {
   // Create node identifier
   const nodeId = socket.id + ":" + uuid();

   log(`Node connected: ${nodeId}`);

   // Open connection
   await ChainHandler.init();

   this.clientBroadcast(socket, SocketActions.NEW_NODE_JOINED, { nodeId });
   this.broadcastTo(socket, SocketActions.GET_CHAIN, (await ChainHandler.getChain()));
   
   // Close connection
   await ChainHandler.close();
  });
 }

 private clientBroadcast(s: io.Socket, ev: SocketActions, data?: any) {
  return s.broadcast.emit(ev, data);
 }

 private broadcastTo(s: io.Socket, ev: SocketActions, data?: any) {
  return this.s.to(s.id).emit(ev, data);
 }

 broadcast(ev: SocketActions, data?: any) {
  return this.s.emit(ev, data);
 }
}
