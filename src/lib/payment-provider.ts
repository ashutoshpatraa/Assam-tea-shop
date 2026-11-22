export interface PaymentProvider {
  createPayment(params: {
    orderId: string;
    amountPaise: number;
    payeeId: string;
    payeeName: string;
  }): Promise<{
    deepLink: string;
    qrValue: string;
  }>;
  submitVerification(params: {
    orderId: string;
    utr: string;
  }): Promise<{ accepted: boolean }>;
}

export class ManualUpiPaymentProvider implements PaymentProvider {
  async createPayment(params: {
    orderId: string;
    amountPaise: number;
    payeeId: string;
    payeeName: string;
  }) {
    const qrValue =
      `upi://pay?pa=${encodeURIComponent(params.payeeId)}` +
      `&pn=${encodeURIComponent(params.payeeName)}` +
      `&am=${(params.amountPaise / 100).toFixed(2)}` +
      `&cu=INR&tn=${encodeURIComponent(params.orderId)}`;
    return { deepLink: qrValue, qrValue };
  }

  async submitVerification({ utr }: { orderId: string; utr: string }) {
    return { accepted: utr.trim().length >= 6 };
  }
}
