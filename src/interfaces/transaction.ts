export interface Transaction {
 txInputs: Array<{ address: string; value: number; }>;
 txOutputs: Array<{ address: string; value: number; }>;
 txFee: { address: string; value: number; }
}
