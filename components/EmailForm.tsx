"use client";

import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface EmailFormProps {
  source?: string;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

const EmailForm = ({ 
  source = 'unknown',
  placeholder = "Enter your email address",
  buttonText = "Notify Me",
  className = ""
}: EmailFormProps) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/email-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source,
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Thank you! We\'ll notify you when we launch.');
        setEmail('');
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to subscribe. Please try again.');
      
      // Reset error after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  if (status === 'success') {
    return (
      <div className={`w-full max-w-md space-y-4 ${className}`}>
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-green-800 font-medium">Subscription Confirmed!</p>
            <p className="text-green-600 text-sm">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md space-y-4 ${className}`}>
      <form 
        onSubmit={handleSubmit} 
        className="w-full space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-2"
      >
        {/* Input Group */}
        <div className="flex-1 flex items-center bg-white rounded-xl border-2 border-gray-200 p-1 pl-4 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
          <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
          
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            required
            disabled={status === 'loading'}
            className="w-full flex-grow bg-transparent px-3 py-3 text-gray-700 placeholder-gray-400 focus:outline-none disabled:opacity-50"
          />
        </div>
        
        {/* Button */}
        <button 
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          {status === 'loading' ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Subscribing...</span>
            </div>
          ) : (
            buttonText
          )}
        </button>
      </form>

      {/* Error Message */}
      {status === 'error' && message && (
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 text-sm font-medium">Subscription Failed</p>
            <p className="text-red-600 text-sm">{message}</p>
          </div>
        </div>
      )}

      {/* Privacy Note */}
      <p className="text-xs text-gray-500 text-center">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
};

export default EmailForm;