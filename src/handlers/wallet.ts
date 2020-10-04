import * as crypto from "crypto-js";
import { v4 as uuid } from "uuid";
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
   {
    privateKey: crypto.SHA256(passphrase).toString(),
    publicKey: crypto.SHA256(uuid()).toString()
   }
  );
 }

 static async createWallet(phrase: string): Promise<Wallet> {
  const keyPair = await this.generateKeyPair(phrase);
  console.log(keyPair.privateKey, keyPair.publicKey);
  const wallet: Wallet = {
   privateKey: keyPair.privateKey,
   publicKey: keyPair.publicKey,
   address: crypto.SHA256(keyPair.publicKey + keyPair.privateKey).toString() + ":" + uuid(),
   balance: 0   
  };

  await this.map.put(wallet.address, wallet);

  const w: Wallet = await this.map.get(wallet.address);
  return Promise.resolve(w);
 }

 static async getWallet(address: string): Promise<Wallet> {
  const wallet: Wallet = await this.map.get(address);
  return Promise.resolve(wallet);
 }

 static async importWallet(phrase: string): Promise<Wallet> {
  const keyPair = await this.generateKeyPair(phrase);
  const wallet: Wallet = (await this.map.entrySet())
   .map(([, w]) => w)
   .find((w) => w.privateKey === keyPair.privateKey);

  return Promise.resolve(wallet);
 }

 static async updateWalletBalance(address: string, amount: number): Promise<Wallet> {
  const wallet: Wallet = await this.map.get(address);
  const newWallet = wallet;
  newWallet.balance = newWallet.balance + amount;
  const updatedWallet = await this.map.put(address, newWallet);
  return Promise.resolve(updatedWallet);
 }

 static async deleteWallet(address: string): Promise<void> {
  await this.map.delete(address);
 }

 static async close() {
  this.client.shutdown();
 }
}
