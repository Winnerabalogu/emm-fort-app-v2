import Image from 'next/image';

const Preloader = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
       
        <div className="animate-zoom">
          <Image
            src="/logos/og-logo.png"
            alt="EMM-Fort Logo"
            width={80} 
            height={80}
            priority 
          />
        </div>
        <p className="text-sm text-text-secondary animate-pulse">
          Loading Application...
        </p>
      </div>
    </div>
  );
};

export default Preloader;