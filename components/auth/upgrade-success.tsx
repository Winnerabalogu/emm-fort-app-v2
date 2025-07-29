"use client";

import { useEffect, useState } from "react"; // <-- Import useState
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoaderCircle } from "lucide-react";

export default function UpgradeSuccessPage() {
  const { update } = useSession();
  const router = useRouter();

  // State to prevent the effect from running multiple times
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    // Check the flag to ensure this logic runs only once.
    if (isFinalizing) {
      return;
    }

    const finalizeUpgrade = async () => {
      // Set the flag to true immediately to prevent re-entry.
      setIsFinalizing(true);

      try {
        // 1. Update the session token in the browser. This is the most crucial step.
        // It refetches the session and updates the JWT with the new tier.
        await update();

        // 2. Navigate to the tier page. Next.js will automatically fetch the
        // fresh data and Server Components for this page. No refresh() is needed.
        router.push('/dashboard/tier');

      } catch (error) {
        console.error("Failed to finalize upgrade:", error);
        // Fallback: If anything goes wrong, send the user to the main dashboard.
        router.push('/dashboard');
      }
    };

    finalizeUpgrade();
  }, [isFinalizing, update, router]); // Add the flag to the dependency array

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white shadow-xl rounded-2xl max-w-md w-full">
        <LoaderCircle className="h-16 w-16 text-orange-500 animate-spin mx-auto" />
        <h1 className="mt-6 text-3xl font-bold text-gray-900">Upgrade Successful!</h1>
        <p className="mt-3 text-gray-600">
          Finalizing your account and redirecting...
        </p>
      </div>
    </div>
  );
}