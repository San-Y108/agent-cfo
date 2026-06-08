import type { PaymentPlan } from "../api/types";
import { mockContributors, mockSubscriptionBills } from "./contribution-records";

export const mockPaymentPlan: PaymentPlan = {
  id: "plan-1",
  items: [
    {
      id: "item-1",
      recipient: mockContributors[0],
      amount: 20,
      token: "USDC",
      description: "撰写 AgentCFO 技术文档",
    },
    {
      id: "item-2",
      recipient: mockContributors[1],
      amount: 15,
      token: "USDC",
      description: "设计 Demo Console UI",
    },
    {
      id: "item-3",
      recipient: mockContributors[2],
      amount: 10,
      token: "USDC",
      description: "社群 AMA 主持",
    },
    {
      id: "item-4",
      recipient: {
        id: "vendor-1",
        name: mockSubscriptionBills[0].serviceName,
        walletAddress: "0xDataAPIVendorAddress",
        role: "工具订阅",
      },
      amount: mockSubscriptionBills[0].amount,
      token: mockSubscriptionBills[0].token,
      description: `Data API 订阅 (${mockSubscriptionBills[0].billingPeriod})`,
    },
  ],
  totalAmount: 50,
  token: "USDC",
  status: "draft",
  createdAt: "2026-06-07T00:00:00Z",
};
