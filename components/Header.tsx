"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { Menu, X } from 'lucide-react';

const Header = () => {
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
        <Link href="/" className="flex items-center gap-2">          
          <Image 
            src="/logos/og-logo.png"
            alt="EMM-Fort Logo"
            width={40} 
            height={40}
            className="h-10 w-auto"
          />          
          <span className="text-xl font-bold text-black">
            <span className="text-brand-orange">EM</span>M-Fort
          </span>
        </Link>
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (            
            <Link key={link.name} href={link.href} className="hover-underline-animation text-black font-semibold">
              {link.name.toUpperCase()}
            </Link>
          ))}
        </nav>        
        <div className="md:hidden text-black">
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>      
      <div
        className={`
          md:hidden absolute top-full left-0 right-0 bg-white shadow-lg overflow-hidden transition-all duration-500 ease-in-out
          ${isOpen ? 'max-h-screen' : 'max-h-0'}
        `}
      >
        <nav className="flex flex-col items-center space-y-2 py-8">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              className={`
                block py-2 text-lg font-medium w-full text-center hover-underline-animation text-black
                transition-all duration-300 ease-out
                ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
              `}
              style={{ transitionDelay: `${isOpen ? index * 100 : 0}ms` }}
              onClick={() => setIsOpen(false)}
            >
              {link.name.toUpperCase()}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;