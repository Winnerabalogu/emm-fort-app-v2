import Image from 'next/image';
import StoreButton from '@/components/StoreButton';
import { CompanyPageData } from '@/lib/companyData';

type AppDownloadLayoutProps = Omit<CompanyPageData, 'slug' | 'layoutType' | 'companyName' | 'logoUrl'>

const AppDownloadLayout = ({ pageTitle, pageDescription, mainImageUrl, imagePosition }: AppDownloadLayoutProps) => {
  const isImageRight = imagePosition === 'right';

  return (
    <div className={`container mx-auto px-4 flex flex-col-reverse ${isImageRight ? 'md:flex-row' : 'md:flex-row-reverse'} items-center justify-center gap-12 min-h-[calc(100vh-80px)]`}>
      {/* Text Content */}
      <div className="md:w-1/2 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" dangerouslySetInnerHTML={{ __html: pageTitle }} />
        <p className="text-gray-600 text-lg mb-8">{pageDescription}</p>
        <div className="flex justify-center md:justify-start gap-4">
          <StoreButton store="apple" href="/#waitlist" />
          <StoreButton store="google" href="/#waitlist" />
        </div>
      </div>
      
      {/* Image Content */}
      <div className="md:w-1/2 flex justify-center">
          <Image src={mainImageUrl} alt="App mockup" width={400} height={800} className="max-h-[70vh] w-auto"/>
      </div>
    </div>
  );
};

export default AppDownloadLayout;