/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Phone, Lock, Instagram, MessageSquare, Sparkles, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreatorRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    instagramHandle: '',
    tiktokHandle: '',
    whatsappNumber: '',
    contentStyle: '',
    followersCount: '',
    agreeToTerms: false
  });

  const handleInputChange = (e: { target: { name: string; value: string; type: string; checked?: boolean; }; }) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) return 'Full name is required';
        if (!formData.email.trim()) return 'Email is required';
        if (!formData.phone.trim()) return 'Phone number is required';
        if (!formData.password.trim()) return 'Password is required';
        if (formData.password.length < 6) return 'Password must be at least 6 characters';
        return null;
      case 2:
        if (!formData.instagramHandle.trim() && !formData.tiktokHandle.trim()) {
          return 'Please provide at least one social media handle';
        }
        if (!formData.whatsappNumber.trim()) return 'WhatsApp number is required';
        if (!formData.contentStyle) return 'Please select your content style';
        return null;
      case 3:
        if (!formData.agreeToTerms) return 'Please accept the terms and conditions';
        return null;
      default:
        return null;
    }
  };

  const handleNextStep = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

const handleSubmit = async () => {
  const validationError = validateStep(3);
  if (validationError) {
    setError(validationError);
    return;
  }
  
  setIsLoading(true);
  setError('');
  
  try {
    const response = await fetch('/api/creator/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
setSuccess(true);
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Redirect to check email page
    router.push(`/auth/check-your-email?email=${encodeURIComponent(formData.email)}`);
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Registration failed');
  } finally {
    setIsLoading(false);
  }
};

  const contentStyles = [
    'Grocery Hauls & Unboxing',
    'Lifestyle & Food Content',
    'Recipe & Cooking Videos',
    'Product Reviews',
    'Family & Lifestyle',
    'Fashion & Beauty',
    'Health & Fitness',
    'Other'
  ];

  const followersRanges = [
    'Just starting (0 - 1K)',
    'Growing (1K - 10K)',
    'Established (10K - 50K)',
    'Influencer (50K - 100K)',
    'Creator (100K+)'
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-orange-100">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to the Creator Program!</h2>
            <p className="text-gray-600 mb-6">
              Check your email for next steps. We'll review your application and get back to you within 24 hours.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl py-3 font-medium hover:shadow-lg transition-all duration-200"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full px-4 py-2 mb-4 shadow-lg">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium text-sm">Creator Program</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Join Our Creators
            </h1>
            <p className="text-gray-600 text-lg">
              Earn 5% commission sharing grocery deals you love
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} of 3</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / 3) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's get started</h2>
                    <p className="text-gray-600">Tell us about yourself</p>
                  </div>

                  <div className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          name="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="+234 xxx xxx xxxx"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Create Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="Minimum 6 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Social Media Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your social presence</h2>
                    <p className="text-gray-600">Connect your platforms to start creating</p>
                  </div>

                  <div className="space-y-5">
                    {/* Instagram Handle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram Handle
                      </label>
                      <div className="relative">
                        <Instagram className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          name="instagramHandle"
                          type="text"
                          value={formData.instagramHandle}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="@yourusername"
                        />
                      </div>
                    </div>

                    {/* TikTok Handle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        TikTok Handle
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 bg-black text-white text-xs font-bold rounded flex items-center justify-center">
                          T
                        </div>
                        <input
                          name="tiktokHandle"
                          type="text"
                          value={formData.tiktokHandle}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="@yourusername"
                        />
                      </div>
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Number
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          name="whatsappNumber"
                          type="tel"
                          value={formData.whatsappNumber}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="For program support"
                        />
                      </div>
                    </div>

                    {/* Content Style */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Style
                      </label>
                      <select
                        name="contentStyle"
                        value={formData.contentStyle}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="">What type of content do you create?</option>
                        {contentStyles.map((style) => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </div>

                    {/* Followers Count */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Follower Count <span className="text-gray-500">(optional)</span>
                      </label>
                      <select
                        name="followersCount"
                        value={formData.followersCount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="">Your current following size</option>
                        {followersRanges.map((range) => (
                          <option key={range} value={range}>{range}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">We use this info to:</p>
                        <p className="text-blue-700">Personalize your experience, provide support, and feature your amazing content!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Terms and Confirmation */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">You're almost in!</h2>
                    <p className="text-gray-600">Just review the terms and you're all set</p>
                  </div>

                  {/* Program Benefits */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Your Creator Benefits:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                        <span>5% commission on referrals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                        <span>Personal referral code</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                        <span>Content kit & templates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                        <span>Real-time earnings tracker</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                        <span>Bi-weekly payments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                        <span>Feature opportunities</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-orange-600 bg-white border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 mt-0.5 flex-shrink-0"
                      />
                      <div className="text-sm text-gray-700">
                        <p>
                          I agree to the{' '}
                          <button className="text-orange-600 hover:text-orange-700 underline font-medium">
                            Creator Terms
                          </button>
                          ,{' '}
                          <button className="text-orange-600 hover:text-orange-700 underline font-medium">
                            Privacy Policy
                          </button>
                          , and{' '}
                          <button className="text-orange-600 hover:text-orange-700 underline font-medium">
                            Content Guidelines
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="bg-gray-50 px-6 sm:px-8 py-6 flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">Back</span>
                  </button>
                )}
              </div>
              
              <div>
                {currentStep < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Join Program</span>
                        <CheckCircle className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}