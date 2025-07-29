"use client";

import React from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useForm, SubmitHandler } from 'react-hook-form';
import { RegisterStep3Form } from '@/lib/form-types';

interface Props {
  onFinalSubmit: (data: RegisterStep3Form) => void;
  loading: boolean;
}

const RegisterStep3 = ({ onFinalSubmit, loading }: Props) => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterStep3Form>();

  const onStep3Submit: SubmitHandler<RegisterStep3Form> = (data) => {
    onFinalSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onStep3Submit)} className="space-y-4">
      <Input label="Bank Name" {...register("bankName", { required: "Bank name is required" })} placeholder="Enter bank name" />
      {errors.bankName && <p className="text-sm text-red-600">{errors.bankName.message?.toString()}</p>}

      <Input label="First Name" {...register("firstName", { required: "First name is required" })} placeholder="Enter first name" />
      {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message?.toString()}</p>}
      
      <Input label="Last Name" {...register("lastName", { required: "Last name is required" })} placeholder="Enter last name" />
      {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message?.toString()}</p>}

      <Input label="Account Number" type="number" {...register("accountNumber", { required: "Account number is required" })} placeholder="Enter account number" />
      {errors.accountNumber && <p className="text-sm text-red-600">{errors.accountNumber.message?.toString()}</p>}
      
      <Button type="submit" isLoading={loading}>
        Sign Up
      </Button>
    </form>
  );
};

export default RegisterStep3;