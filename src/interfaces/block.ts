import { Transaction } from "./transaction";

export interface Block {
 index: number;
 timestamp: Date;
 nonce?: number;
 transaction: Transaction;
 hash: string;
 previousHash?: string;
}
