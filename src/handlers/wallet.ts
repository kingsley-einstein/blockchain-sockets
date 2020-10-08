import * as crypto from "crypto-js";
import { v4 as uuid } from "uuid";
import { Client, IMap } from "hazelcast-client";
import { FS } from "../helpers";
import { Wallet } from "../interfaces";

export class WalletHandler {
 private map: IMap<string, Wallet>;

 async define(c: Client) {
  this.map = await c.getMap("wallets");
 }

 private async generateKeyPair(passphrase: string) {
  return Promise.resolve(
   {
    privateKey: crypto.SHA256(passphrase).toString(),
    publicKey: crypto.SHA256(uuid()).toString()
   }
  );
 }

 async createWallet(phrase: string): Promise<Wallet> {
  const keyPair = await this.generateKeyPair(phrase);
  
  // console.log(keyPair.privateKey, keyPair.publicKey);
  
  const wallet: Wallet = {
   privateKey: keyPair.privateKey,
   publicKey: keyPair.publicKey,
   address: crypto.SHA256(keyPair.publicKey + keyPair.privateKey).toString() + ":" + uuid(),
   balance: 0   
  };

  await this.map.put(wallet.address, wallet, 0);

  const w: Wallet = await this.map.get(wallet.address);
  
  let walletsFromFile: Array<Wallet> = JSON.parse((<string> FS.fileRead("wallets.data")));

  walletsFromFile = [...walletsFromFile, w];

  FS.fileWrite("wallets.data", JSON.stringify(walletsFromFile));

  return Promise.resolve(w);
 }

 async getWallet(address: string): Promise<Wallet> {
  const walletsFromFile: Array<Wallet> = JSON.parse((<string> FS.fileRead("wallets.data")));

  for (const w of walletsFromFile)
   await this.map.put(w.address, w, 0);

  const wallet: Wallet = await this.map.get(address);
  
  return Promise.resolve(wallet);
 }

 async importWallet(phrase: string): Promise<Wallet> {
  const keyPair = await this.generateKeyPair(phrase);
  
  const walletsFromFile: Array<Wallet> = JSON.parse((<string>FS.fileRead("wallets.data")));

  for (const w of walletsFromFile)
   await this.map.put(w.address, w);
  
  const wallet: Wallet = (await this.map.entrySet())
   .map(([, w]) => w)
   .find((w) => w.privateKey === keyPair.privateKey);

  return Promise.resolve(wallet);
 }

 async updateWalletBalance(address: string, amount: number): Promise<Wallet> {
  let walletsFromFile: Array<Wallet> = JSON.parse((<string> FS.fileRead("wallets.data")));

  const wFF = walletsFromFile.find((item) => item.address === address);
  wFF.balance = wFF.balance + amount;
  walletsFromFile = walletsFromFile.filter((w) => w.address !== address);
  walletsFromFile = [...walletsFromFile, wFF];

  FS.fileWrite("wallets.data", JSON.stringify(walletsFromFile));

  for (const w of walletsFromFile)
   await this.map.put(w.address, w);

  const wallet: Wallet = await this.map.get(address);

  return Promise.resolve(wallet);
 }

 async deleteWallet(address: string): Promise<void> {
  let walletsFromFile: Array<Wallet> = JSON.parse((<string> FS.fileRead("wallets.data")));

  walletsFromFile = walletsFromFile.filter((w) => w.address === address);

  FS.fileWrite("wallets.data", JSON.stringify(walletsFromFile));
  await this.map.delete(address);
 }
}
