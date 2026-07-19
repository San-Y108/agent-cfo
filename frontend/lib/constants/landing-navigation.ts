import type { DictKey } from "@/lib/i18n/dict";

export const LANDING_SECTION_IDS = {
  overview: "platform",
  payoutFlow: "workflow",
  demoAudit: "guardrails",
  team: "team",
  buildTimeline: "timeline",
  faqSecurity: "faq",
} as const;

export const LANDING_NAV_ITEMS: {
  key: DictKey;
  href: `#${string}`;
}[] = [
  { key: "nav.platform", href: `#${LANDING_SECTION_IDS.overview}` },
  { key: "nav.workflow", href: `#${LANDING_SECTION_IDS.payoutFlow}` },
  { key: "nav.guardrails", href: `#${LANDING_SECTION_IDS.demoAudit}` },
  { key: "nav.team", href: `#${LANDING_SECTION_IDS.team}` },
  { key: "nav.timeline", href: `#${LANDING_SECTION_IDS.buildTimeline}` },
  { key: "nav.faq", href: `#${LANDING_SECTION_IDS.faqSecurity}` },
];
