import crypto from "crypto";
import * as crypto2 from "crypto-js";
import { Client, IMap } from "hazelcast-client";
import { Wallet } from "../interfaces";

export class WalletHandler {
 static client: Client;
 static map: IMap<string, Wallet>;

 static async init() {
  this.client = await Client.newHazelcastClient();
  this.map = await this.client.getMap("wallets");
 }

 private static async generateKeyPair(passphrase: string) {
  return Promise.resolve(
   crypto.generateKeyPairSync("rsa", {
    modulusLength: 500,
    publicKeyEncoding: {
     type: "spki",
     format: "pem"
    },
    privateKeyEncoding: {
     type: "pkcs8",
     format: "pem",
     cipher: "aes-256-cbc",
     passphrase
    }
   })
  );
 }

 static async createWallet(phrase: string): Promise<Wallet> {
  const keyPair = await this.generateKeyPair(phrase);
  const wallet: Wallet = {
   privateKey: keyPair.privateKey,
   publicKey: keyPair.publicKey,
   address: crypto2.SHA256(keyPair.publicKey + keyPair.privateKey).toString(),
   balance: 0   
  };
  const w = await this.map.put(wallet.address, wallet);
  return Promise.resolve(w);
 }
}
