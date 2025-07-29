// components/modals/WithdrawalModal.tsx
"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useModal } from '@/contexts/ModalContext';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { formatNaira } from '@/lib/utils/formatCurrency';

interface WithdrawalFormInputs {
  amount: number;
  password: string;
}

export default function WithdrawalModal() {
  const { closeModal, payload } = useModal();
  const balance = payload?.balance ?? 0;

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<WithdrawalFormInputs>();

  const onSubmit: SubmitHandler<WithdrawalFormInputs> = async (data) => {
    setMessage(null);
    try {
      const response = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Ensure amount is sent as a number
          amount: Number(data.amount), 
          password: data.password
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to submit request.");
      
      setMessage({ type: 'success', text: result.message });
      // Optionally close the modal after a delay
      setTimeout(() => closeModal(), 2000);

    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : "An unknown error occurred." });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Request Withdrawal</h2>
        <button type="button" onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100"><X /></button>
      </div>
      
      {/* If a success message is shown, don't show the form */}
      {message?.type === 'success' ? (
        <div className="text-center p-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <p className="mt-4 font-semibold text-gray-800">{message.text}</p>
            <p className="text-sm text-gray-500">Your request is now pending approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">Available to Withdraw</p>
            <p className="text-2xl font-bold text-blue-900">{formatNaira(balance)}</p>
          </div>
          
          <div>
            <Input
              label="Amount to Withdraw (NGN)"
              type="number"
              step="0.01"
              {...register("amount", {
                required: "Amount is required.",
                valueAsNumber: true,
                max: { value: balance, message: "Amount cannot exceed your available balance." },
                min: { value: 100, message: "Minimum withdrawal is ₦100." } // Example minimum
              })}
              error={errors.amount?.message}
            />
          </div>
          <div>
            <Input
              label="Confirm with your Password"
              type="password"
              {...register("password", { required: "Password is required to authorize." })}
              error={errors.password?.message}
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
            <Button type="submit" isLoading={isSubmitting}>Request Withdrawal</Button>
          </div>
        </div>
      )}
    </form>
  );
}