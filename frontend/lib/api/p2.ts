import { request, postJson } from "./client";
import type {
  ExternalReference,
  ExternalReferenceCreate,
  ExternalReferenceList,
  MultichainReadiness,
  RequestInvoiceCreate,
  RequestInvoiceRecord,
  SafePermissionReference,
  SafePermissionReferenceRequest,
  SablierStreamPreview,
  SablierStreamPreviewRequest,
  TreasuryBudgetPartition,
} from "./types";

/**
 * P2 Preview / Linked Evidence adapter layer.
 *
 * 所有 P2 API 返回 mode="metadata-only" / liveIntegrationEnabled=false。
 * 不创建真实 Sablier stream，不启用 Safe module，不改变 multi-agent 授权。
 * 404 时前端应隐藏 P2 区块或显示 "backend pending deploy"。
 */

// ---- External References ----

export async function createExternalReference(
  payload: ExternalReferenceCreate
): Promise<ExternalReference> {
  return postJson<ExternalReference>("/api/external-references", payload);
}

export async function getExternalReference(externalReferenceId: string): Promise<ExternalReference> {
  return request<ExternalReference>(`/api/external-references/${encodeURIComponent(externalReferenceId)}`);
}

export async function listExternalReferences(params?: {
  paymentPlanId?: string;
  auditReportId?: string;
  referenceType?: string;
}): Promise<ExternalReferenceList> {
  const searchParams = new URLSearchParams();
  if (params?.paymentPlanId) searchParams.set("paymentPlanId", params.paymentPlanId);
  if (params?.auditReportId) searchParams.set("auditReportId", params.auditReportId);
  if (params?.referenceType) searchParams.set("referenceType", params.referenceType);
  const query = searchParams.toString();
  return request<ExternalReferenceList>(`/api/external-references${query ? `?${query}` : ""}`);
}

// ---- Request Invoices ----

export async function createRequestInvoice(payload: RequestInvoiceCreate): Promise<RequestInvoiceRecord> {
  return postJson<RequestInvoiceRecord>("/api/request-invoices", payload);
}

export async function getRequestInvoice(externalReferenceId: string): Promise<RequestInvoiceRecord> {
  return request<RequestInvoiceRecord>(`/api/request-invoices/${encodeURIComponent(externalReferenceId)}`);
}

// ---- Sablier Stream Preview ----

export async function createSablierStreamPreview(
  payload: SablierStreamPreviewRequest
): Promise<SablierStreamPreview> {
  return postJson<SablierStreamPreview>("/api/sablier-stream-previews", payload);
}

// ---- Safe Permission Reference ----

export async function createSafePermissionReference(
  payload: SafePermissionReferenceRequest
): Promise<SafePermissionReference> {
  return postJson<SafePermissionReference>("/api/safe-permission-references", payload);
}

// ---- Multichain Readiness ----

export async function getMultichainReadiness(): Promise<MultichainReadiness> {
  return request<MultichainReadiness>("/api/multichain-readiness");
}

// ---- Treasury Budget Partitions ----

export async function getTreasuryBudgetPartition(paymentPlanId: string): Promise<TreasuryBudgetPartition> {
  return request<TreasuryBudgetPartition>(
    `/api/treasury-budget-partitions/${encodeURIComponent(paymentPlanId)}`
  );
}
