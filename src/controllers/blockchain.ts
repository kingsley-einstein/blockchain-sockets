import express from "express";
import { Wallet, TX, BlockChain } from "../cache";
import { CustomError } from "../custom";


export class ChainController {
 static async addToChain(req: express.Request, res: express.Response) {
  try {
   // Get  address
   const { address, txId } = req.params;

   // Find wallet
   const w = await Wallet.getWallet(address);

   // Throw error if wallet is not found
   if (!w)
    throw new CustomError(404, `Wallet with address ${address} not found`);

   // Find transaction
   const tx = await TX.getTx(txId);

   if (!tx)
    throw new CustomError(404, `Transaction wth id ${txId} not found`);

   // Approve the transaction
   const approvedTx = await TX.approveTx(tx, w);

   // Add block to chain
   const b = await BlockChain.addBlock({
    index: 0,
    hash: "",
    timestamp: new Date(Date.now()),
    previousHash: "",
    nonce: 0,
    transaction: approvedTx
   })

   // Log block to console
   console.log({ ...b });

   // Get chain
   const chain = await BlockChain.getChain();

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
