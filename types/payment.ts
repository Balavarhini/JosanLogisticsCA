export type PaymentMethodType = "card" | "upi" | "wallet";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  last4?: string;
  expiry?: string;
  isDefault?: boolean;
}
