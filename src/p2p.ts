import socket from "socket.io";
import http from "http";
import debug from "debug";
import { Node } from "./interface";

const log = debug("socket");

enum SocketActions {
 NODE_JOINED = "NODE_JOINED",
 NODE_LEFT = "NODE_LEFT"
}

export class P2P {
 nodes: Set<Node>;
 io: socket.Server;

 constructor() {
  this.nodes = new Set();
  this.nodes.add({
   id: "",
   joined: null
  });
 }

 init(server: http.Server) {
  this.io = socket(server);

  this.io.on("connection", (s) => {
   this.nodes.add({
    id: s.id,
    joined: new Date(Date.now())
   });
   
   let node: Node = null;

   for (const n of this.nodes)
    if (n.id === s.id)
     node = n;
   
   log(`New node connected ${JSON.stringify(node)}`);
   this.broadcast(SocketActions.NODE_JOINED, node);

   s.on("disconnect", (data: Node) => {
    this.nodes.delete(data);
    this.broadcast(SocketActions.NODE_LEFT, data);
   });
  });
 }

 private broadcast(event: SocketActions, data: any = {}) {
  this.io.emit(event, data);
 }

 getNodes() {
  return this.nodes;
 }
}
