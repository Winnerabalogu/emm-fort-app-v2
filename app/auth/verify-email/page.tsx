"use client"
import AuthLayout from "@/components/auth/AuthLayout";
import VerifyTokenPage from "@/components/auth/verify-email";


export default function VerifyEmail() {   

    return (       
        <AuthLayout>
            <VerifyTokenPage/>  
            </AuthLayout>      
    );
}