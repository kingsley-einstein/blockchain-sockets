import express from "express";
import { WalletHandler, TransactionHandler, ChainHandler } from "../handlers";
import { CustomError } from "../custom";


export class ChainController {
 static async addToChain(req: express.Request, res: express.Response) {
  try {
   // Open connections
   await WalletHandler.init();

   // Get  address
   const { address, txId } = req.params;

   // Find wallet
   const w = await WalletHandler.getWallet(address);

   // Throw error if wallet is not found
   if (!w)
    throw new CustomError(404, `Wallet with address ${address} not found`);

   // Close wallet connection
   await WalletHandler.close();

   // Open transaction connection
   await TransactionHandler.init();

   // Find transaction
   const tx = await TransactionHandler.getTx(txId);

   if (!tx)
    throw new CustomError(404, `Transaction wth id ${txId} not found`);

   // Approve the transaction
   const approvedTx = await TransactionHandler.approveTx(tx, w);

   // Close transaction connection
   await TransactionHandler.close();

   // Block data
   const data = { transaction: approvedTx };

   // Open chain connection
   await ChainHandler.init();

   // Add block to chain
   const b = await ChainHandler.addBlock(Math.floor(Math.random() * 5), data);

   // Log block to console
   console.log({ ...b });

   // Get chain
   const chain = await ChainHandler.getChain();

   // Close chain connection
   await ChainHandler.close();

   // Send the chain as a response
   res.status(200).json({
    statusCode: 200,
    response: chain
   });
  } catch (error) {
   res.status(error.errorCode || 500).json({
    statusCode: error.errorCode || 500,
    response: error.message
   });
  }
 }
}
