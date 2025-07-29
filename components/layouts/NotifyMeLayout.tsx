import Image from 'next/image';
import EmailForm from '@/components/EmailForm';
import { CompanyPageData } from '@/lib/companyData';

type NotifyMeLayoutProps = Omit<CompanyPageData, 'slug' | 'layoutType' | 'companyName' | 'logoUrl'>

const NotifyMeLayout = ({ pageTitle, pageDescription, mainImageUrl, imagePosition }: NotifyMeLayoutProps) => {
  const isImageRight = imagePosition === 'right';
  return (
    <div className={`container mx-auto px-4 flex flex-col-reverse ${isImageRight ? 'md:flex-row' : 'md:flex-row-reverse'} items-center justify-center gap-12 min-h-[calc(100vh-80px)]`}>
      {/* Text Content */}
      <div className="md:w-1/2 text-center md:text-left">
        <p className="text-gray-500 font-semibold mb-2">{pageDescription}</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">{pageTitle}</h1>
        <EmailForm />
      </div>
      
      {/* Image Content */}
      <div className="md:w-1/2 flex justify-center">
        <Image src={mainImageUrl} alt="App mockup" width={400} height={800} className="max-h-[70vh] w-auto" />
      </div>
    </div>
  );
};

export default NotifyMeLayout;