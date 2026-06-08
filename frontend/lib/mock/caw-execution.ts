import type { CAWExecution } from "../api/types";

export const mockCAWExecution: CAWExecution = {
  agentWalletAddress: "0xAgentWalletPlaceholder",
  testnetName: "Base Sepolia",
  transactionHash: "0xMockTransactionHash1234567890abcdef",
  paymentStatus: "success",
  token: "USDC",
  amount: 20,
  recipientWallet: "0xAliceWalletAddress",
  permissionBoundary: "budget:50/singleLimit:25/token:USDC/approval:required",
};

export const mockCAWExecutions: CAWExecution[] = [
  {
    ...mockCAWExecution,
    amount: 20,
    recipientWallet: "0xAliceWalletAddress",
    transactionHash: "0xMockTxAlice1234567890abcdef",
  },
  {
    ...mockCAWExecution,
    amount: 10,
    recipientWallet: "0xCharlieWalletAddress",
    transactionHash: "0xMockTxCharlie1234567890abcdef",
    paymentStatus: "success",
  },
  {
    ...mockCAWExecution,
    amount: 5,
    recipientWallet: "0xDataAPIVendorAddress",
    transactionHash: "0xMockTxVendor1234567890abcdef",
    paymentStatus: "success",
  },
];
