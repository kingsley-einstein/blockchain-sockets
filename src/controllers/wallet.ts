import express from "express";
import { Wallet } from "../cache";
import { CustomError } from "../custom";

export class WalletController {
 static async create(req: express.Request, res: express.Response) {
  try {
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
   const w = await Wallet.createWallet(phrase);

   // API response
   const response = { ...w };

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

   // Get wallet address
   const { address } = req.params;

   // Get wallet by address
   const w = await Wallet.getWallet(address);

   if (!w)
    throw new CustomError(404, "Wallet not found");

   // API response
   const response = { ...w };

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
   // Recovery phrase
   const { phrase } = req.body;

   // Imported wallet
   const w = await Wallet.importWallet(phrase);

   if (!w)
    throw new CustomError(404, "Wallet not found.");

   // API response
   const response = { ...w };

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
}
