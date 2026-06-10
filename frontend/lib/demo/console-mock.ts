/**
 * Console 业务层 mock 数据（来自 AI Studio 设计稿）
 * 与 backend contract 同形，供 /console 各 tab 使用
 */

import { BudgetRules, ContributorRecord } from "../types/console";

export const MOCK_RULES: BudgetRules = {
  monthlyBudget: 50,
  singlePaymentLimit: 25,
  allowedToken: "USDC",
  whitelist: [
    "0xAlice1234567890abcdef1234567890abcdef12",
    "0xCharlie1234567890abcdef1234567890abcdef",
    "0xDataAPI1234567890abcdef1234567890abcde",
  ],
};

export const MOCK_RECORDS: ContributorRecord[] = [
  {
    id: "rec_1",
    name: "Alice",
    role: "Contributor",
    task: "Wrote event recap article",
    wallet: "0xAlice1234567890abcdef1234567890abcdef12",
    amount: 20,
    token: "USDC",
  },
  {
    id: "rec_2",
    name: "Bob",
    role: "Designer",
    task: "Designed event poster",
    wallet: "0xBobUnverified890abcdef1234567890abcdef",
    amount: 15,
    token: "USDC",
  },
  {
    id: "rec_3",
    name: "Charlie",
    role: "Operator",
    task: "Managed community and exported data",
    wallet: "0xCharlie1234567890abcdef1234567890abcdef",
    amount: 10,
    token: "USDC",
  },
  {
    id: "rec_4",
    name: "Data API",
    role: "Tool",
    task: "Monthly data subscription",
    wallet: "0xDataAPI1234567890abcdef1234567890abcde",
    amount: 5,
    token: "USDC",
  },
];
