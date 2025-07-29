"use client";

import { useState } from 'react';
import { Mail } from 'lucide-react';

const EmailForm = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Thank you! We will notify ${email} at launch.`);
        setEmail('');
    };

    return (        
        <form 
            onSubmit={handleSubmit} 
            className="w-full max-w-md space-y-3 sm:space-y-0 sm:flex sm:items-center"
        >
            {/* Input Group */}
            <div className="flex w-full items-center bg-white rounded-full border border-gray-300 p-1 pl-4 shadow-sm focus-within:ring-2 focus-within:ring-brand-orange">
                <Mail className="h-5 w-5 text-gray-400 shrink-0" />
                
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full flex-grow bg-transparent px-3 py-2 text-gray-700 focus:outline-none"
                />
            </div>
            
            {/* Button */}
            <button 
                type="submit"                 
                className="w-full sm:w-auto sm:ml-2 bg-black text-white font-semibold px-6 py-3 rounded-full hover:bg-gray-800 transition-colors shrink-0"
            >
                Notify Me
            </button>
        </form>
    );
}

export default EmailForm;