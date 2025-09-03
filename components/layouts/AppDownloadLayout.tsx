import Image from 'next/image';
import StoreButton from '@/components/StoreButton';
import { CompanyPageData } from '@/lib/companyData';
import { Shield, Smartphone, Download } from 'lucide-react';

type AppDownloadLayoutProps = Omit<
  CompanyPageData,
  'slug' | 'layoutType' | 'companyName' | 'logoUrl'
>;

const AppDownloadLayout = ({
  pageTitle,
  pageDescription,
  mainImageUrl,
  imagePosition,
}: AppDownloadLayoutProps) => {
  const isImageRight = imagePosition === 'right';

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center">
      <div className="container mx-auto px-4">
        <div
          className={`flex flex-col-reverse ${
            isImageRight ? 'lg:flex-row' : 'lg:flex-row-reverse'
          } items-center justify-center gap-12 lg:gap-16`}
        >
          {/* Text Content */}
          <div className="lg:w-1/2 text-center lg:text-left space-y-8">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              <Download className="h-4 w-4" />
              <span>Coming Soon</span>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <h1
                className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight"
                dangerouslySetInnerHTML={{ __html: pageTitle }}
              />

              <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                {pageDescription}
              </p>
            </div>

            {/* Download Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <StoreButton store="apple" href="/contact" />
                <StoreButton store="google" href="/contact" />
              </div>

              <p className="text-gray-500 text-sm text-center lg:text-left">
                Will be available on both iOS and Android platforms.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Mobile Optimized
                </h3>
                <p className="text-gray-600 text-sm">
                  Designed for the best mobile experience across all devices.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Bank-Level Security
                </h3>
                <p className="text-gray-600 text-sm">
                  Your data is protected with enterprise-grade security.
                </p>
              </div>
            </div>
          </div>

          {/* Image Content */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-3xl opacity-20 blur-2xl"></div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200 rounded-full opacity-30 animate-bounce"></div>
              <div
                className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-100 rounded-full opacity-20 animate-pulse"
                style={{ animationDelay: '1s' }}
              ></div>

              {/* Phone Mockup */}
              <div className="relative z-10">
                <div className="bg-gray-900 p-2 rounded-3xl shadow-2xl">
                  <Image
                    src={mainImageUrl}
                    alt="App mockup"
                    width={400}
                    height={800}
                    className="max-h-[70vh] w-auto rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default AppDownloadLayout;
