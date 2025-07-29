"use client";
import React from 'react';
import RadioGroup from '@/components/ui/RadioGroup';
import { Tier } from '@/lib/types'; 

interface Props {
  selectedTier: Tier;
  setSelectedTier: React.Dispatch<React.SetStateAction<Tier>>;
}

const tierOptions = [
  { value: 'Platinum', label: 'Platinum', price: '#100,000.00' },
  { value: 'Gold', label: 'Gold', price: '#50,000.00' },
  { value: 'Silver', label: 'Silver', price: '#25,000.00' },
  { value: 'Bronze', label: 'Bronze', price: '#10,000.00' },
  { value: 'Basic', label: 'Basic', price: 'Free' },
];

const RegisterStep2 = ({ selectedTier, setSelectedTier }: Props) => {  
  const handleTierChange = (value: string) => {
    setSelectedTier(value as Tier);
  };

  return (
    <RadioGroup
      options={tierOptions}
      name="tier"
      selectedValue={selectedTier}
      onChange={handleTierChange}
    />
  );
};

export default RegisterStep2;