"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowLeft } from 'lucide-react';

interface CompanyHeaderProps {
  logoUrl: string;
  companyName: string;
  showBackButton?: boolean;
}

const CompanyHeader = ({ logoUrl, companyName, showBackButton = true }: CompanyHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {     
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/#about" },
    { name: "Our Companies", href: "/#companies" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' 
          : 'bg-white/80 backdrop-blur-sm py-5'
        }
      `}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo and Back Button */}
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline text-sm font-medium">Home</span>
            </Link>
          )}
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image 
                src={logoUrl} 
                alt={`${companyName} Logo`} 
                width={60} 
                height={40} 
                className="rounded-lg shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-lg leading-tight">{companyName}</span>
              <span className="text-xs text-gray-500">Part of EMM-Fort Group</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navLinks.map(link => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative group"
            >
              {link.name}
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden z-50">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            aria-label="Toggle menu" 
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`
          md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 
          overflow-hidden transition-all duration-500 ease-in-out shadow-lg
          ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <nav className="flex flex-col p-6 space-y-4">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              className={`
                block py-3 px-4 text-lg font-medium text-gray-700 hover:text-gray-900 
                hover:bg-gray-50 rounded-lg transition-all duration-300 ease-out
                ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
              `}
              style={{ transitionDelay: `${isOpen ? index * 100 + 100 : 0}ms` }}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {showBackButton && (
            <Link
              href="/"
              className={`
                block py-3 px-4 text-sm font-medium text-orange-600 hover:text-orange-700 
                hover:bg-orange-50 rounded-lg border border-orange-200 transition-all duration-300 ease-out
                ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
              `}
              style={{ transitionDelay: `${isOpen ? navLinks.length * 100 + 100 : 0}ms` }}
              onClick={() => setIsOpen(false)}
            >
              ← Home
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default CompanyHeader;