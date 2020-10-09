import express from "express";
import { v4 as uuid } from "uuid";
import { Wallet, TX } from "../cache";
import { Transaction } from "../interfaces";
import { CustomError } from "../custom";

export class TransactionController {
 static async create(req: express.Request, res: express.Response) {
  try {
   const tx: Transaction = {
    txId: uuid(),
    txInputs: req.body.txInputs,
    txOutputs: req.body.txOutputs,
    txStatus: "pending",
    txFee: req.body.txFee,
    txHash: ""
   };

   // Check transaction inputs
   for (const input of tx.txInputs) {
    const w = await Wallet.getWallet(input.address);

    if (!w)
     throw new CustomError(404, `Wallet with address ${input.address} not found`);

    if (!!w && w.balance < input.value)
     throw new CustomError(400, "Insufficient wallet balance");
   }

   // Check transaction outputs
   for (const output of tx.txOutputs) {
    const w = await Wallet.getWallet(output.address);

    if (!w)
     throw new CustomError(404, `Wallet with address ${output.address} not found`);
   }

   // Create transaction
   const tx2 = await TX.createTx(tx);

   res.status(201).json({
    statusCode: 201,
    response: tx2
   });
  } catch (error) {
   res.status(error.errorCode || 500).json({
    statusCode: error.errorCode || 500,
    response: error.message
   });
  }
 }

 static async getAllTransactionsByInput(req: express.Request, res: express.Response) {
  try {
   // Get address
   const { address } = req.params;

   // Find transactions
   const txs = await TX.getAllTxsByInputAddress(address);

  res.status(200).json({
   statusCode: 200,
   response: txs
  });
  } catch (error) {
   res.status(500).json({
    statusCode: 500,
    response: error.message
   });
  }
 }

 static async getAllTransactionsByOutput(req: express.Request, res: express.Response) {
  try {
   // Get address
   const { address } = req.params;

   // Find transactions
   const txs = await TX.getAllTxsByOutputAddress(address);

  res.status(200).json({
   statusCode: 200,
   response: txs
  });
  } catch (error) {
   res.status(500).json({
    statusCode: 500,
    response: error.message
   });
  }
 }
}
