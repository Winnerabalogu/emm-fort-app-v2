"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

interface CompanyHeaderProps {
  logoUrl: string;
  companyName: string;
}

const CompanyHeader = ({ logoUrl, companyName }: CompanyHeaderProps) => {
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
    { name: "About Us", href: "/" },
    { name: "Our Companies", href: "/#companies" },
    { name: "Contact Us", href: "/" },
  ];

  return (
   <header 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${isScrolled ? 'bg-white/95 shadow-lg py-3' : 'bg-white py-5'}
      `}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50">
          <Image src={logoUrl} alt={`${companyName} Logo`} width={60} height={40} />
          <span className="font-semibold text-gray-800 ">{companyName}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
          {navLinks.map(link => (
            <Link key={link.name} href={link.href} className="hover-underline-animation transition-colors">{link.name}</Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden z-50">
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu" className="text-gray-800">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`
          md:hidden absolute top-0 left-0 right-0 bg-white shadow-lg overflow-hidden transition-all duration-500 ease-in-out
          ${isOpen ? 'max-h-screen pt-24 pb-8' : 'max-h-0'}
        `}
      >
        <nav className="flex flex-col items-center space-y-4">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              className={`
                block py-2 text-lg font-medium w-full text-center text-gray-700 hover:text-black
                transition-all duration-300 ease-out
                ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
              `}
              style={{ transitionDelay: `${isOpen ? index * 100 + 100 : 0}ms` }}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default CompanyHeader;