import express from "express";
import { v4 as uuid } from "uuid";
import { WalletHandler, TransactionHandler } from "../handlers";
import { Transaction } from "../interfaces";
import { CustomError } from "../custom";
import { SocketActions } from "../actions";
import { p2p } from "..";

export class WalletController {
 static async create(req: express.Request, res: express.Response) {
  try {
   // Initialize the client
   await WalletHandler.init();

   // Get request body
   const { body } = req;

   // Array of phrases
   const recoveryPhrase: Array<string> = body.recoveryPhrase;

   // Throw error if array length is less than 12
   if (recoveryPhrase.length < 12)
    throw new CustomError(400, "Length of recovery phrase must be at least 12.");

   // String that would hold appended strings
   let phrase: string = "";
   
   for (const p of recoveryPhrase)
    phrase += p + " ";

   // Create wallet
   const w = await WalletHandler.createWallet(phrase);

   // API response
   const response = {
    address: w.address,
    publicKey: w.publicKey,
    balance: w.balance
   };

   // Close connection
   await WalletHandler.close();

   // Send API response
   res.status(201).json({
    statusCode: 201,
    response
   });
  } catch (error) {
   res.status(error.errorCode || 500).json({
    statusCode: error.errorCode || 500,
    response: error.message
   });
  }
 }

 static async getWallet(req: express.Request, res: express.Response) {
  try {
   // Open connection
   await WalletHandler.init();

   // Get wallet address
   const { address } = req.params;

   // Get wallet by address
   const w = await WalletHandler.getWallet(address);

   if (!w)
    throw new CustomError(404, "Wallet not found");

   // API response
   const response = {
    publicKey: w.publicKey,
    address: w.address,
    balance: w.balance
   };

   // Close connection
   await WalletHandler.close();

   // Send API response
   res.status(200).json({
    statusCode: 200,
    response
   });
  } catch (error) {
   res.status(error.errorCode || 500).json({
    statusCode: error.errorCode || 500,
    response: error.message
   });
  }
 }

 static async importWallet(req: express.Request, res: express.Response) {
  try {
   // Open connection
   await WalletHandler.init();

   // Recovery phrase
   const { phrase } = req.body;

   // Imported wallet
   const w = await WalletHandler.importWallet(phrase);

   if (!w)
    throw new CustomError(404, "Wallet not found.");

   // API response
   const response = {
    address: w.address,
    publicKey: w.publicKey,
    balance: w.balance
   };

   // Close connection
   await WalletHandler.close();

   res.status(200).json({
    statusCode: 200,
    response
   });
  } catch (error) {
   res.status(error.errorCode || 500).json({
    statusCode: error.errorCode || 500,
    response: error.message
   });
  }
 }

 static async sendBalance(req: express.Request, res: express.Response) {
  try {
   // Open wallet connection
   await WalletHandler.init();

   // Open tx connection
   await TransactionHandler.init();

   // Get request parameters
   const { fromAddress, toAddress, balance } = req.params;
   
   // Sender
   const senderWallet = await WalletHandler.getWallet(fromAddress);

   if (!senderWallet)
    throw new CustomError(404, "Wallet not found.");

   // Receiver
   const receiverWallet = await WalletHandler.getWallet(toAddress);

   if (!receiverWallet)
    throw new CustomError(404, "Wallet not found.");

   if (senderWallet.balance < parseInt(balance))
    throw new CustomError(404, "Balance not sufficient");

   const newTx: Transaction = {
    txId: uuid(),
    txFee: { address: senderWallet.address, value: req.body.fee },
    txHash: "",
    txStatus: "pending",
    txInputs: [{ address: senderWallet.address, value: req.body.balance }],
    txOutputs: [{ address: receiverWallet.address, value: req.body.balance }]
   };

   const addedTxs = await TransactionHandler.createTx(newTx);

   // Close wallet connection
   await WalletHandler.close();

   // Close tx connection
   await TransactionHandler.close();

   // Broadcast the transaction to all nodes
   p2p.broadcast(SocketActions.NEW_TRANSACTION, addedTxs);

   res.status(200).json({
    statusCode: 200,
    response: addedTxs
   })
  } catch (error) {
   res.status(error.errorCode || 500).json({
    statusCode: error.errorCode || 500,
    response: error.message
   });
  }
 }
}
