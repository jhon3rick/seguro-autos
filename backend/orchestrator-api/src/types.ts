export type InsuranceRequest = {
  id: string;
  email: string;
  fullName: string;
  nationalId: string;
  plate: string;
};

export type DriverProfile = {
  nationalId: string;
  birthdate: string;
  infractionsCount: number;
};

export type CarInfo = {
  plate: string;
  year: number;
  model: string;
  ownerNationalId: string;
};

export type ModelPrice = {
  model: string;
  price: number;
};

export type PlanType = "basic" | "advanced" | "premium";
