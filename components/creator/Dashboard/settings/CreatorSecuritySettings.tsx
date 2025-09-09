// components/creator/Dashboard/settings/CreatorSecuritySettings.tsx
"use client";

import { SubmitHandler, useForm } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { Lock, CreditCard, Eye, EyeOff, Shield, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface WithdrawalDetailsForm {
  bankName: string;
  accountNumber: string;
  firstName: string;
  lastName: string;
}

const ChangePassword = () => {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ChangePasswordForm>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const newPassword = watch('newPassword');

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthMap = {
      0: { text: 'Very Weak', color: 'bg-red-500' },
      1: { text: 'Weak', color: 'bg-red-400' },
      2: { text: 'Fair', color: 'bg-yellow-400' },
      3: { text: 'Good', color: 'bg-blue-400' },
      4: { text: 'Strong', color: 'bg-green-400' },
      5: { text: 'Very Strong', color: 'bg-green-500' }
    };

    return { strength, ...strengthMap[strength as keyof typeof strengthMap] };
  };

  const passwordStrength = getPasswordStrength(newPassword || '');

  const onSubmit: SubmitHandler<ChangePasswordForm> = async (data) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/creator/security/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage({ type: 'success', text: result.message });
      reset();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              {...register("currentPassword", { required: "Current password is required" })}
              error={errors.currentPassword?.message}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              {...register("newPassword", { 
                required: "New password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" }
              })}
              error={errors.newPassword?.message}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            
            {newPassword && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{passwordStrength.text}</span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Password should contain:</p>
                  <ul className="grid grid-cols-2 gap-1">
                    <li className={`flex items-center gap-1 ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={12} />
                      8+ characters
                    </li>
                    <li className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={12} />
                      Uppercase letter
                    </li>
                    <li className={`flex items-center gap-1 ${/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={12} />
                      Lowercase letter
                    </li>
                    <li className={`flex items-center gap-1 ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 size={12} />
                      Number
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword", { 
                required: "Please confirm your password",
                validate: (value) => value === newPassword || "Passwords don't match"
              })}
              error={errors.confirmPassword?.message}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            isLoading={loading} 
            className="!w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};

const WithdrawalDetails = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WithdrawalDetailsForm>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  useEffect(() => {
    fetch('/api/creator/withdrawal-details') 
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          reset(data); 
        }
      });
  }, [reset]);
  
  const onSubmit: SubmitHandler<WithdrawalDetailsForm> = async (data) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/creator/withdrawal-details', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage({ type: 'success', text: result.message });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input 
              label="Bank Name" 
              {...register("bankName", { required: "Bank name is required" })} 
              error={errors.bankName?.message}
              placeholder="e.g., First Bank of Nigeria"
            />
            <Input 
              label="Account Number" 
              {...register("accountNumber", { 
                required: "Account number is required",
                pattern: { value: /^\d{10}$/, message: "Account number must be 10 digits" }
              })} 
              error={errors.accountNumber?.message}
              placeholder="1234567890"
            />
          </div>
          <div className="space-y-4">
            <Input 
              label="Account First Name" 
              {...register("firstName", { required: "First name is required" })} 
              error={errors.firstName?.message}
              placeholder="John"
            />
            <Input 
              label="Account Last Name" 
              {...register("lastName", { required: "Last name is required" })} 
              error={errors.lastName?.message}
              placeholder="Doe"
            />
          </div>
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            isLoading={loading} 
            className="!w-auto px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-200 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Save Details
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function CreatorSecuritySettings() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Security & Payments</h2>
            <p className="text-gray-600">Manage your account security and withdrawal settings</p>
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lock size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
              <p className="text-sm text-gray-600">Update your account password for better security</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ChangePassword />
        </div>
      </div>

      {/* Withdrawal Details Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Withdrawal Details</h3>
              <p className="text-sm text-gray-600">Bank information for processing your creator earnings</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <DollarSign size={16} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium mb-1">Important for Creators:</p>
                <p className="text-sm text-amber-700">
                  Your withdrawal details must match your bank records exactly. This is where your commission payments and referral earnings will be sent. Incorrect details may cause payment delays.
                </p>
              </div>
            </div>
          </div>
          <WithdrawalDetails />
        </div>
      </div>

      {/* Creator Security Tips */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Shield size={20} />
          Creator Security Tips
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p>Use a unique password that you don&#39;t use anywhere else</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p>Keep your bank details updated for timely payments</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p>Never share your login credentials with anyone</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p>Monitor your earnings and transactions regularly</p>
          </div>
        </div>
      </div>
    </div>
  );
}