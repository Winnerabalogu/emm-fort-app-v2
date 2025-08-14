/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

const REDIRECT_ERROR_CODES = [
  "NEXT_REDIRECT", 
  "NAVIGATION",
];

export async function adminAuthenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error: any) {
    const isRedirect = REDIRECT_ERROR_CODES.some(code =>
      error.digest?.startsWith(code)
    );
    if (isRedirect) {
      throw error;
    }

    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return "Invalid admin credentials or insufficient privileges.";
      }
      return "An authentication error occurred.";
    }

    console.error("Unexpected error in admin authenticate:", error);
    return "An unexpected server error occurred. Please try again.";
  }
}

export async function adminSignOut() {
  try {
    await signOut({ redirectTo: "/admin/login" });
  } catch (error) {
    console.error("Admin signout error:", error);
    throw error;
  }
}