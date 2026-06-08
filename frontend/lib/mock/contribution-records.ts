import type { ContributionRecord, SubscriptionBill } from "../api/types";

export const mockContributors = [
  {
    id: "user-1",
    name: "Alice",
    walletAddress: "0xAliceWalletAddress",
    role: "内容贡献",
  },
  {
    id: "user-2",
    name: "Bob",
    walletAddress: "0xBobWalletAddress",
    role: "设计贡献",
  },
  {
    id: "user-3",
    name: "Charlie",
    walletAddress: "0xCharlieWalletAddress",
    role: "社群运营贡献",
  },
];

export const mockContributionRecords: ContributionRecord[] = [
  {
    id: "contrib-1",
    contributor: mockContributors[0],
    taskDescription: "撰写 AgentCFO 技术文档",
    amount: 20,
    token: "USDC",
    status: "approved",
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "contrib-2",
    contributor: mockContributors[1],
    taskDescription: "设计 Demo Console UI",
    amount: 15,
    token: "USDC",
    status: "approved",
    createdAt: "2026-06-02T00:00:00Z",
  },
  {
    id: "contrib-3",
    contributor: mockContributors[2],
    taskDescription: "社群 AMA 主持",
    amount: 10,
    token: "USDC",
    status: "approved",
    createdAt: "2026-06-03T00:00:00Z",
  },
];

export const mockSubscriptionBills: SubscriptionBill[] = [
  {
    id: "sub-1",
    serviceName: "Data API",
    amount: 5,
    token: "USDC",
    billingPeriod: "2026-06",
  },
];
