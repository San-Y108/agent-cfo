// 通用工具函数

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatAmount(amount: number, token: string): string {
  return `${amount} ${token}`;
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN");
}
