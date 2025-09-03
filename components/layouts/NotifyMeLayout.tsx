import Image from 'next/image';
import EmailForm from '@/components/EmailForm';
import { CompanyPageData } from '@/lib/companyData';
import { Clock, Users, Zap } from 'lucide-react';

type NotifyMeLayoutProps = Omit<CompanyPageData, 'slug' | 'layoutType' | 'companyName' | 'logoUrl'>

const NotifyMeLayout = ({ pageTitle,  mainImageUrl, imagePosition }: NotifyMeLayoutProps) => {
  const isImageRight = imagePosition === 'right';
  
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center">
      <div className="container mx-auto px-4">
        <div className={`flex flex-col-reverse ${isImageRight ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center justify-center gap-12 lg:gap-16`}>
          
          {/* Text Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            {/* Status Badge */}
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mt-8">
              <Zap className="h-4 w-4" />
              <span>Coming Soon</span>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
            
              <div>                
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  {pageTitle}
                </h1>
              </div>
              
              <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
                Be the first to experience our innovative platform. Get exclusive early access and special launch benefits.
              </p>
            </div>

            {/* Email Form */}
            <div className="space-y-6">
              <EmailForm 
                source={pageTitle.toLowerCase().replace(/\s+/g, '_')}
                placeholder="Your email address"
                buttonText="Get Early Access"
                className="max-w-md mx-auto lg:mx-0"
              />
              
              {/* Social Proof */}
              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Get Notified When We launch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Launch Date will be announced Soon</span>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <Zap className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">Experience blazing-fast performance with our optimized platform.</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">User-Centric</h3>
                <p className="text-gray-600 text-sm">Built with your needs in mind, every feature serves a purpose.</p>
              </div>
            </div>
          </div>
          
          {/* Image Content */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-200 to-orange-100 rounded-3xl opacity-20 blur-2xl"></div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-200 rounded-full opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-orange-100 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
              
              {/* Main Image */}
              <div className="relative z-10 bg-white p-4 rounded-3xl shadow-2xl">
                <Image 
                  src={mainImageUrl} 
                  alt="App Preview" 
                  width={400} 
                  height={800} 
                  className="max-h-[60vh] w-auto rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotifyMeLayout;