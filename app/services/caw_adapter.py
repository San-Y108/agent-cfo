from app.models import PaymentExecutionItem, PaymentItem, PaymentStatus


class MockCawAdapter:
    mode = "mock"
    agent_wallet_address = "mock-agent-wallet"

    def create_transfer(self, execution_id: str, payment: PaymentItem) -> PaymentExecutionItem:
        return PaymentExecutionItem(
            paymentItemId=payment.id,
            status=PaymentStatus.EXECUTED,
            mode=self.mode,
            agentWalletAddress=self.agent_wallet_address,
            txHash=None,
            cawRequestId=f"mock_caw_{execution_id}_{payment.id}",
        )

