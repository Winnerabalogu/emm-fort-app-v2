/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState } from "react"
import { useInView } from "react-intersection-observer"

interface MembershipFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  instagramHandle: string;
  tiktokHandle: string;
  whatsappNumber: string;
  contentStyle: string;
  followersCount: string;
  birthday: string;
  gender: string;
  country: string;
  niche: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function MembershipForm() {
  const { ref: formRef, inView: formInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const [membershipForm, setMembershipForm] = useState<MembershipFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    instagramHandle: "",
    tiktokHandle: "",
    whatsappNumber: "",
    contentStyle: "",
    followersCount: "",
    birthday: "",
    gender: "",
    country: "",
    niche: "",
    agreeToTerms: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const membershipBenefits = [
    "Access to our private community platform where you can engage with like-minded creators",
    "Monthly 1:1 coaching sessions for top-tier creators",
    "Access to brand collaboration opportunities and exclusive campaigns",
    "Priority support and dedicated account management",
    "Regular competitions with attractive prizes and recognition",
  ]

  const contentStyleOptions = [
    "Lifestyle",
    "Fashion & Beauty",
    "Food & Cooking",
    "Travel",
    "Technology",
    "Gaming",
    "Fitness & Health",
    "Education",
    "Comedy & Entertainment",
    "Business & Finance",
    "Arts & Crafts",
    "Music",
    "Other"
  ]

  const followersOptions = [
    "Less than 1K",
    "1K - 10K",
    "10K - 50K",
    "50K - 100K",
    "100K - 500K",
    "500K - 1M",
    "More than 1M"
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setMembershipForm({
      ...membershipForm,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    })
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    
    if (!membershipForm.fullName.trim() || membershipForm.fullName.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters'
    }
    
    if (!membershipForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(membershipForm.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!membershipForm.phone.trim() || membershipForm.phone.length < 10) {
      errors.phone = 'Phone number must be at least 10 characters'
    }
    
    if (!membershipForm.password || membershipForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (!membershipForm.instagramHandle && !membershipForm.tiktokHandle) {
      errors.socialMedia = 'Please provide at least one social media handle (Instagram or TikTok)'
    }
    
    if (!membershipForm.whatsappNumber.trim() || membershipForm.whatsappNumber.length < 10) {
      errors.whatsappNumber = 'WhatsApp number is required'
    }
    
    if (!membershipForm.contentStyle) {
      errors.contentStyle = 'Please select your content style'
    }
    
    if (!membershipForm.agreeToTerms) {
      errors.agreeToTerms = 'You must accept the terms and conditions'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')
    
    try {
      const response = await fetch('/api/creator/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(membershipForm),
      })
      
      const data = await response.json()
      
      if (response.ok && data.user) {
        setSubmitStatus('success')
        setSubmitMessage(data.message || 'Registration successful! Please check your email to verify your account.')
        // Reset form
        setMembershipForm({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          instagramHandle: "",
          tiktokHandle: "",
          whatsappNumber: "",
          contentStyle: "",
          followersCount: "",
          birthday: "",
          gender: "",
          country: "",
          niche: "",
          agreeToTerms: false,
        })
      } else {
        setSubmitStatus('error')
        if (data.details && data.details.issues) {
          // Handle Zod validation errors
          const zodErrors: FormErrors = {}
          data.details.issues.forEach((issue: any) => {
            if (issue.path && issue.path.length > 0) {
              zodErrors[issue.path[0]] = issue.message
            }
          })
          setFormErrors(zodErrors)
          setSubmitMessage('Please fix the errors below and try again.')
        } else {
          setSubmitMessage(data.error || 'Registration failed. Please try again.')
        }
      }
    } catch (error) {
      console.error('Membership registration error:', error)
      setSubmitStatus('error')
      setSubmitMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section ref={formRef} className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div
            className={`transition-all duration-1000 ease-out
              ${formInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
            `}
          >
            <div className="bg-gray-50 rounded-2xl p-8">
              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-700 font-medium">{submitMessage}</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p className="text-red-700 font-medium">{submitMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={membershipForm.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                        formErrors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Your Full Name"
                      required
                    />
                    {formErrors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={membershipForm.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                        formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="your.email@example.com"
                      required
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={membershipForm.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                        formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="+62 xxx xxx xxxx"
                      required
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={membershipForm.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                        formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Create a password"
                      required
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Instagram Handle</label>
                    <input
                      type="text"
                      name="instagramHandle"
                      value={membershipForm.instagramHandle}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                        formErrors.instagramHandle ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="@yourusername"
                    />
                    {formErrors.instagramHandle && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.instagramHandle}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">TikTok Handle</label>
                    <input
                      type="text"
                      name="tiktokHandle"
                      value={membershipForm.tiktokHandle}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                        formErrors.tiktokHandle ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="@yourusername"
                    />
                    {formErrors.tiktokHandle && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.tiktokHandle}</p>
                    )}
                  </div>
                </div>

                {/* Show error if neither social media handle is provided */}
                {formErrors.socialMedia && (
                  <p className="text-red-500 text-sm">{formErrors.socialMedia}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">WhatsApp Number *</label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={membershipForm.whatsappNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                        formErrors.whatsappNumber ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="+62 xxx xxx xxxx"
                      required
                    />
                    {formErrors.whatsappNumber && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.whatsappNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Content Style *</label>
                    <select
                      name="contentStyle"
                      value={membershipForm.contentStyle}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all ${
                        formErrors.contentStyle ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      required
                    >
                      <option value="">Select Content Style</option>
                      {contentStyleOptions.map((style) => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                    {formErrors.contentStyle && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.contentStyle}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Followers Count</label>
                    <select
                      name="followersCount"
                      value={membershipForm.followersCount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select Followers Count</option>
                      {followersOptions.map((count) => (
                        <option key={count} value={count}>{count}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Birthday</label>
                    <input
                      type="date"
                      name="birthday"
                      value={membershipForm.birthday}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Gender</label>
                    <select
                      name="gender"
                      value={membershipForm.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={membershipForm.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="Your Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Content Niche</label>
                  <input
                    type="text"
                    name="niche"
                    value={membershipForm.niche}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g., Fashion, Food, Travel, Tech..."
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={membershipForm.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    required
                  />
                  <label className="text-sm text-gray-700">
                    I agree to the <a href="/terms" className="text-orange-500 hover:text-orange-600 underline">Terms and Conditions</a> and <a href="/privacy" className="text-orange-500 hover:text-orange-600 underline">Privacy Policy</a> *
                  </label>
                </div>
                {formErrors.agreeToTerms && (
                  <p className="text-red-500 text-sm">{formErrors.agreeToTerms}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:scale-105 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    "Register Now"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Benefits List */}
          <div
            className={`transition-all duration-1000 ease-out
              ${formInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
            `}
          >
            <h6 className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">JOIN NOW</h6>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Join our membership now to support the talents.
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Become part of an exclusive community that nurtures creativity and supports emerging talents. Your
              membership directly contributes to empowering the next generation of content creators.
            </p>

            <div className="space-y-4 mb-8">
              <h4 className="text-lg font-bold text-gray-900">Includes:</h4>
              <div className="space-y-3">
                {membershipBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 text-sm">
                <strong>Note:</strong> After registration, you&apos;ll receive a verification email. Please check your inbox and verify your account to complete the registration process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}