// components/modals/SaveModal.tsx
"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useModal } from '@/contexts/ModalContext';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface SaveFormInputs {
  amount: number;
  purpose: string;
}

export default function SaveModal() {
  const { closeModal } = useModal();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SaveFormInputs>();

  const onSubmit: SubmitHandler<SaveFormInputs> = async (data) => {
    setMessage(null);
    try {
      const response = await fetch('/api/savings/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(data.amount), purpose: data.purpose }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to submit request.");
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => closeModal(), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : "An unknown error occurred." });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Request to Save Funds</h2>
        <button type="button" onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100"><X /></button>
      </div>
      
      {message?.type === 'success' ? (
        <div className="text-center p-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <p className="mt-4 font-semibold text-gray-800">{message.text}</p>
            <p className="text-sm text-gray-500">An admin will be in touch to follow up.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Please enter the amount and purpose for this savings request. An administrator will contact you to complete the process.</p>
          <div>
            <Input
              label="Amount to Save (NGN)"
              type="number"
              step="0.01"
              {...register("amount", { required: "Amount is required.", valueAsNumber: true })}
              error={errors.amount?.message}
            />
          </div>
          <div>
            <Input
              label="Purpose of Saving"
              type="text"
              {...register("purpose", { required: "Purpose is required." })}
              error={errors.purpose?.message}
              placeholder="e.g., Target savings, Investment"
            />
          </div>
          {message?.type === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                <AlertCircle className="h-5 w-5" />
                {message.text}
            </div>
          )}
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" onClick={closeModal} variant="secondary">Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Submit Request</Button>
          </div>
        </div>
      )}
    </form>
  );
}