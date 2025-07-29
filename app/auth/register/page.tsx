"use client"
import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";
import Preloader from "@/components/ui/Preloader";
import { Suspense } from "react";


export default function RegisterPage() {   

    return (       
         <Suspense fallback={<Preloader />}>
        <AuthLayout>            
            <RegisterForm/>  
            </AuthLayout>   
            </Suspense>   
    );
}