/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const REDIRECT_ERROR_CODES = [
  "NEXT_REDIRECT",
  "NAVIGATION",
];

// Regular user authentication
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
 try {
    const callbackUrl = formData.get('callbackUrl')?.toString() || '/dashboard';
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirectTo: callbackUrl,
    });
  } catch (error: any) {
    const isRedirect = REDIRECT_ERROR_CODES.some(code =>
      error.digest?.startsWith(code)
    );
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

// Creator-specific authentication
export async function authenticateCreator(
  prevState: string | undefined,
  formData: FormData,
) {
try {
    const callbackUrl = formData.get('callbackUrl')?.toString() || '/creator/dashboard';
    const result = await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirect: false,
      redirectTo: callbackUrl,
    });

    if (result?.error) {
      return "Invalid email or password.";
    }
    return null;
  } catch (error: any) {
    const isRedirect = REDIRECT_ERROR_CODES.some(code =>
      error.digest?.startsWith(code)
    );
    if (isRedirect) {
      throw error;
    }

    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return "Invalid email or password.";
      }
      return "An authentication error occurred.";
    }

    console.error("Unexpected error in authenticateCreator:", error);
    return "An unexpected server error occurred. Please try again.";
  }
}