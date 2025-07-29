"use client"; 

import Link from 'next/link';

import { Apple, Smartphone } from 'lucide-react';

interface StoreButtonProps {
  store: 'apple' | 'google';
  href: string;
}


const storeInfo = {
  apple: {
    
    IconComponent: Apple,
    text: 'Download on the',
    name: 'Apple Store',
  },
  google: {
    IconComponent: Smartphone,
    text: 'GET IT ON',
    name: 'Google Play',
  },
};

const StoreButton = ({ store, href }: StoreButtonProps) => {
  const { IconComponent, text, name } = storeInfo[store];

  return (
    <Link 
      href={href} 
      className="flex items-center bg-white text-black px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200"
    >      
      <IconComponent className="h-7 w-7" />
      
      <div className="ml-3 text-left">
        <p className="text-xs uppercase">{text}</p>
        <p className="text-md font-semibold">{name}</p>
      </div>
    </Link>
  );
};

export default StoreButton;