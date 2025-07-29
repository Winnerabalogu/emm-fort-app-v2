"use client"; 

import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';

interface SubsidiaryCardProps {
  logoUrl: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  imagePosition: 'left' | 'right';
}

const SubsidiaryCard = ({ logoUrl, title, description, imageUrl, linkUrl ,imagePosition }: SubsidiaryCardProps) => {
  const isImageLeft = imagePosition === 'left';

  
  const { ref, inView } = useInView({
    triggerOnce: true, 
    threshold: 0.1,    
  });

  return (
    <div
      ref={ref}      
      className={`
        bg-white rounded-4xl p-6 md:p-10
        transition-all duration-1000 ease-out
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
      `}
    >
      <div className={`flex flex-col ${isImageLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-center`}>
        
        
        <div
          className={`
            w-full md:w-5/12 flex-shrink-0
            transition-all duration-700 ease-out
            ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
          `}
          style={{ transitionDelay: inView ? '200ms' : '0ms' }} 
        >
          <div className="bg-black p-3 rounded-2xl shadow-lg">
            <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-7/12 text-center md:text-left">
          <div 
             className={`transition-all duration-500 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
             style={{ transitionDelay: inView ? '300ms' : '0ms' }}
          >
            <Image src={logoUrl} alt={`${title} logo`} width={60} height={60} className="mx-auto md:mx-0 mb-4" />
          </div>

          {/* Title Animation */}
          <h3 
            className={`text-black text-3xl md:text-4xl font-bold mb-4 transition-all duration-500 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            style={{ transitionDelay: inView ? '400ms' : '0ms' }}
          >
            {title}
          </h3>

          <p 
            className={`text-black text-lg mb-6 transition-all duration-500 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            style={{ transitionDelay: inView ? '500ms' : '0ms' }}
          >
            {description}
          </p>

          {/* Button Animation */}
         <div className={`transition-all duration-500 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`} style={{ transitionDelay: inView ? '600ms' : '0ms' }}>            
            <Link href={linkUrl} className="inline-block border-2 border-brand-orange text-brand-orange font-semibold py-3 px-8 rounded-full hover:bg-brand-orange hover:text-white transition-all duration-300">
              Get started now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubsidiaryCard;
