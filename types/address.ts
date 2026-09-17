export type AddressLabel = "home" | "work" | "other";

export interface Address {
  id: string;
  label: AddressLabel;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}
