import { Tier } from './types';

export type RegisterStep1Form = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  referral?: string;
  password: string;
  
};

export type RegisterStep3Form = {
  bankName: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
};

export type FullRegistrationForm = RegisterStep1Form & RegisterStep3Form & {
    tier: Tier; // Use the specific Tier type
};

export type RegistrationPayload = {
    step1: RegisterStep1Form; // All fields are required from step 1
    step2: { tier: Tier }; // Tier is required
    step3: RegisterStep3Form; // All fields are required from step 3
};