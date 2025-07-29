export interface CompanyPageData {
  slug: string;
  layoutType: 'appDownload' | 'notifyMe';
  logoUrl: string;
  companyName: string;
  pageTitle: string;
  pageDescription: string;
  mainImageUrl: string;
  imagePosition?: 'left' | 'right'; 
  gradientFrom?: string;
  gradientTo?: string; 
}

export const companyPagesData: CompanyPageData[] = [
  {
    slug: 'realty',
    layoutType: 'appDownload',
    logoUrl: '/logos/realty-logo.png',
    companyName: 'EMM-Fort Realty',
    pageTitle: 'Download Our App and enjoy!',
    pageDescription: 'Experience the future of shopping today! Our mobile app offers a user-friendly interface, secure payment options, and regular updates on new arrivals and promotions. Download the Emm-fort app now and start shopping like never before!',
    mainImageUrl: '/images/realty-app.png',
    imagePosition: 'right',
    gradientFrom: 'from-orange-100/30',
  },
  {
    slug: 'supermarket',
    layoutType: 'appDownload',
    logoUrl: '/logos/supermarket-logo.png',
    companyName: 'EMM-Fort Supermarket',
    pageTitle: 'Download Our App and enjoy!',
    pageDescription: 'Experience the future of shopping today! Our mobile app offers a user-friendly interface, secure payment options, and regular updates on new arrivals and promotions. Download the Emm-fort app now and start shopping like never before!',
    mainImageUrl: '/images/supermarket-app.png',
    imagePosition: 'right',
    gradientFrom: 'from-orange-100/30',
  },
  {
    slug: 'affiliates',
    layoutType: 'appDownload',
    logoUrl: '/logos/affiliates-logo.png',
    companyName: 'EMM-Fort Affiliates',
    pageTitle: 'Download Our App and enjoy!',
    pageDescription: 'Experience the future of shopping today! Our mobile app offers a user-friendly interface, secure payment options, and regular updates on new arrivals and promotions. Download the Emm-fort app now and start shopping like never before!',
    mainImageUrl: '/images/affiliates.png',
    imagePosition: 'right',
    gradientFrom: 'from-orange-100/30',
  },
  {
    slug: 'events',
    layoutType: 'notifyMe',
    logoUrl: '/logos/events-logo.png',
    companyName: 'EMM-Fort Events',
    pageTitle: 'Download Our App Now',
    pageDescription: 'Exclusive content, personalized schedules, and more. Get the most out of your EMM-Fort Event experience with our official app.',
    mainImageUrl: '/images/event-app.png',
    imagePosition: 'right',
    gradientFrom: 'from-rose-100/30',
  },
  {
    slug: 'logistics',
    layoutType: 'notifyMe',
    logoUrl: '/logos/logistics-logo.png',
    companyName: 'EMM-Fort Logistics',
    pageTitle: 'Download Our App and enjoy!',
    pageDescription: 'Experience the future of shipping today! Our mobile app offers a user-friendly interface, secure payment options, and regular updates on new arrivals and promotions. Download the Emm-fort app now and start shipping like never before!',
    mainImageUrl: '/images/logistics-app.png',
    imagePosition: 'left',
    gradientFrom: 'from-blue-100/30',
  },
  {
    slug: 'advertising',
    layoutType: 'notifyMe',
    logoUrl: '/logos/advertising-logo.png',
    companyName: 'EMM-Fort Advertising',
    pageTitle: 'Get Notified When we Launch',
    pageDescription: '-Coming Soon', 
    mainImageUrl: '/images/advertising-app.png',
    imagePosition: 'right',
    gradientFrom: 'from-orange-200/30',
  },
  {
    slug: 'consulting',
    layoutType: 'notifyMe',
    logoUrl: '/logos/consulting-logo.png',
    companyName: 'EMM-Fort Consulting',
    pageTitle: 'Get Notified When we Launch',
    pageDescription: '-Coming Soon', 
    mainImageUrl: '/images/consulting-app.png',
    imagePosition: 'right',
    gradientFrom: 'from-orange-200/30',
  },  
];