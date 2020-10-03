export interface Transaction {
 txId: string;
 txHash: string;
 txInputs: Array<{ address: string; value: number; }>;
 txOutputs: Array<{ address: string; value: number; }>;
 txFee: { address: string; value: number; }
 txStatus: "pending" | "declined" | "successful"
}
