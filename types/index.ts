export type Role = "regular" | "owner";

export interface User {
  _id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Gym {
  _id: string;
  ownerId: string;
  name: string;
  address: Address;
  phone: string;
  daypass: {
    available: boolean;
    price: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Pass {
  _id: string;
  userId: string;
  gymId: string;
  code: string;
  validFrom: string;
  validTo: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
