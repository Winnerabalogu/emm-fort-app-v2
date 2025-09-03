"use client"
import AuthLayout from "@/components/auth/AuthLayout";
import VerifyTokenPage from "@/components/auth/verify-token";


export default function VerifyToken() {   

    return (       
        <AuthLayout>
            <VerifyTokenPage/>  
            </AuthLayout>      
    );
}