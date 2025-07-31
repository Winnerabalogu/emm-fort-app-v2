import Image from 'next/image';
import { Tier } from '@prisma/client';
import Link from 'next/link';


export interface TierCardProps {
  tier: Tier | null;
  imageUrl: string;
}

export default function TierCard({ tier, imageUrl }: TierCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-lg flex justify-between items-center overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
      <div>
        <h2 className="text-2xl font-bold">Tier {tier || 'N/A'}</h2>
        <p className="text-sm opacity-80">Current Plan</p>
        <Link href="/dashboard/tier">
        <button className="mt-4 px-5 py-2 text-sm font-semibold bg-white/20 hover:bg-white/30 rounded-full transition-all">
          Upgrade Tier
        </button>
        </Link>
      </div>
      <div className="relative -mr-8 -my-10 opacity-70">
         <Image 
            src={imageUrl} 
            alt={`${tier || 'Default'} tier pyramid`} 
            width={150} 
            height={100}
            style={{ objectFit: 'contain' }} 
          />
      </div>
    </div>
  );
}