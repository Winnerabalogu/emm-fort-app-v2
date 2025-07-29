/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { signIn } from "@/auth";
import { AuthError } from "@auth/core/errors"; 

const REDIRECT_ERROR_CODES = [
  'NEXT_REDIRECT',
  'NAVIGATION', 
];

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error: any) { 
    
    const isRedirect = REDIRECT_ERROR_CODES.some(code => error.digest?.startsWith(code));
    if (isRedirect) {
      throw error;
    }
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return "Invalid email or password.";
      }
      return "An authentication error occurred.";
    }

    console.error("Unexpected error in authenticate:", error);
    return "An unexpected server error occurred. Please try again.";
  }
}