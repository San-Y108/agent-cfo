from collections import Counter

from app.models import BudgetRule, PaymentItem, PaymentStatus, RiskLevel


def check_payment_risks(
    payments: list[PaymentItem],
    budget_rule: BudgetRule,
) -> tuple[PaymentStatus, RiskLevel, float, list[PaymentItem]]:
    wallet_counts = Counter(payment.wallet for payment in payments)
    task_counts = Counter(payment.task for payment in payments)
    total_amount = sum(payment.amount for payment in payments)
    over_budget = total_amount > budget_rule.monthlyBudget

    checked_payments = [
        _check_payment(payment, budget_rule, wallet_counts, task_counts, over_budget)
        for payment in payments
    ]
    any_blocked = any(payment.status == PaymentStatus.BLOCKED for payment in checked_payments)
    remaining_budget = budget_rule.monthlyBudget - total_amount

    if any_blocked:
        return PaymentStatus.BLOCKED, RiskLevel.BLOCKED, remaining_budget, checked_payments
    if budget_rule.requiresHumanApproval:
        return PaymentStatus.NEEDS_APPROVAL, RiskLevel.LOW, remaining_budget, checked_payments
    return PaymentStatus.READY, RiskLevel.LOW, remaining_budget, checked_payments


def _check_payment(
    payment: PaymentItem,
    budget_rule: BudgetRule,
    wallet_counts: Counter,
    task_counts: Counter,
    over_budget: bool,
) -> PaymentItem:
    risks = []
    if over_budget:
        risks.append("Total payment amount exceeds monthly budget")
    if payment.amount > budget_rule.singlePaymentLimit:
        risks.append("Payment amount exceeds single payment limit")
    if payment.token != budget_rule.allowedToken:
        risks.append("Token is not allowed")
    if payment.wallet not in budget_rule.whitelist:
        risks.append("Recipient wallet is not in whitelist")
    if wallet_counts[payment.wallet] > 1:
        risks.append("Duplicate recipient wallet")
    if task_counts[payment.task] > 1:
        risks.append("Duplicate task")

    if risks:
        status = PaymentStatus.BLOCKED
    elif budget_rule.requiresHumanApproval:
        status = PaymentStatus.NEEDS_APPROVAL
    else:
        status = PaymentStatus.READY

    return payment.model_copy(update={"status": status, "risks": risks})
