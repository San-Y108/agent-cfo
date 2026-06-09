import { request } from "./client";
import type { AuditReport } from "./types";

/**
 * Audit Report adapter — GET /api/audit-report/{auditReportId}
 * mock mode 下组件应使用 `lib/mock/audit-report.ts`。
 */
export async function getAuditReport(
  auditReportId: string
): Promise<AuditReport> {
  return request<AuditReport>(
    `/api/audit-report/${encodeURIComponent(auditReportId)}`
  );
}
