"use client";

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim() || formData.subject.length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim() || formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'contact_page'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={() => {
            setStatus('idle');
            setMessage('');
          }}
          className="text-orange-600 hover:text-orange-700 font-semibold"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
            errors.fullName 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-orange-500'
          }`}
          placeholder="Enter your full name"
          disabled={status === 'loading'}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
            errors.email 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-orange-500'
          }`}
          placeholder="your.email@example.com"
          disabled={status === 'loading'}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
          placeholder="+234 123 456 7890"
          disabled={status === 'loading'}
        />
      </div>

      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
          Subject *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
            errors.subject 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-orange-500'
          }`}
          placeholder="What's this about?"
          disabled={status === 'loading'}
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none ${
            errors.message 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-orange-500'
          }`}
          placeholder="Tell us more about your inquiry..."
          disabled={status === 'loading'}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.message.length}/500 characters
        </p>
      </div>

      {/* Error Message */}
      {status === 'error' && message && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Failed to Send Message</p>
            <p className="text-red-600 text-sm">{message}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
      >
        {status === 'loading' ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Sending Message...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Send className="h-5 w-5" />
            <span>Send Message</span>
          </div>
        )}
      </button>

      {/* Privacy Note */}
      <p className="text-xs text-gray-500 text-center">
        By sending this message, you agree to our privacy policy. 
        We&apos;ll only use your information to respond to your inquiry.
      </p>
    </form>
  );
};

export default ContactForm;