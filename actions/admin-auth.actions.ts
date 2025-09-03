/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";

const REDIRECT_ERROR_CODES = [
  "NEXT_REDIRECT", 
  "NAVIGATION",
];

export async function adminAuthenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return "Email and password are required.";
    }
    const user = await prisma.user.findFirst({
      where: { 
        email: { equals: email.toLowerCase().trim(), mode: 'insensitive' } 
      },
      select: {
        id: true,
        role: true,
        emailVerified: true,
      }
    });

    if (!user || !user.emailVerified) {
      return "Invalid admin credentials or account not verified.";
    }

    if (user.role !== 'ADMIN') {
      return "Access denied. Administrator privileges required.";
    }    
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin/overview" 
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
    await signOut({ redirectTo: "/admin/auth/login" }); 
  } catch (error) {
    console.error("Admin signout error:", error);
    throw error;
  }
}