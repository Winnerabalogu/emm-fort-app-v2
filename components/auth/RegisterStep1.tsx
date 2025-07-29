"use client";

import React from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useForm, SubmitHandler } from 'react-hook-form';
import { RegisterStep1Form } from '@/lib/form-types';

interface Props {
  onNext: (data: RegisterStep1Form) => void;
  loading: boolean;
}

const RegisterStep1 = ({ onNext, loading }: Props) => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterStep1Form>();

  const onStep1Submit: SubmitHandler<RegisterStep1Form> = (data) => {
    onNext(data); 
  };

  return (
    <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-4">
      <Input label="FULL NAME" {...register("fullName", { required: "Full name is required" })} placeholder="Enter full name" />
      {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message?.toString()}</p>}

      <Input label="USERNAME" {...register("username", { required: "Username is required" })} placeholder="Enter username" />
      {errors.username && <p className="text-sm text-red-600">{errors.username.message?.toString()}</p>}

      <Input label="EMAIL" type="email" {...register("email", { required: "Email is required" })} placeholder="Enter email address" />
      {errors.email && <p className="text-sm text-red-600">{errors.email.message?.toString()}</p>}

      <Input label="PHONE NUMBER" type="tel" {...register("phone", { required: "Phone number is required" })} placeholder="Enter phone number" />
      {errors.phone && <p className="text-sm text-red-600">{errors.phone.message?.toString()}</p>}
      
      <Input label="REFERRAL (OPTIONAL)" {...register("referral")} placeholder="Enter referral" />

      <Input label="PASSWORD" type="password" {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} placeholder="Enter password" />
      {errors.password && <p className="text-sm text-red-600">{errors.password.message?.toString()}</p>}

      <Button type="submit" isLoading={loading}>
        Continue
      </Button>
    </form>
  );
};

export default RegisterStep1;