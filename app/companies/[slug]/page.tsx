import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import CompanyHeader from '@/components/company/CompanyHeader';
import CompanyFooter from '@/components/company/CompanyFooter';
import { companyPagesData, CompanyPageData } from '@/lib/companyData';
import AppDownloadLayout from '@/components/layouts/AppDownloadLayout';
import NotifyMeLayout from '@/components/layouts/NotifyMeLayout';

interface PageContentProps {
  companyData: CompanyPageData;
}

// --- HELPER FUNCTION ---
async function getCompanyData(slug: string): Promise<CompanyPageData | undefined> {
  return companyPagesData.find((p) => p.slug === slug);
}

// --- METADATA FUNCTION ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyData(slug);

  if (!company) {
    return {
      title: 'Company Not Found',
      description: 'We couldn’t find the company you’re looking for.',
    };
  }

  const { companyName, pageDescription, logoUrl } = company;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https:///emmfortgroup.com';

  const canonicalUrl = new URL(`/companies/${slug}`, baseUrl).toString();
  const ogImage = new URL(logoUrl || '/logos/og-image.png', baseUrl).toString();

  return {
    title: `${companyName} | EMM-Fort Group`,
    description: pageDescription,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${companyName} | EMM-Fort Group`,
      description: pageDescription,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 600,
          alt: `${companyName} Logo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} | EMM-Fort Group`,
      description: pageDescription,
      images: [ogImage],
    },
  };
}



function PageContent({ companyData }: PageContentProps) {
  const { layoutType, gradientFrom, gradientTo, ...props } = companyData;
  const gradientClasses = `bg-gradient-to-br ${gradientFrom || 'from-white'} ${gradientTo || 'to-white'}`;

  return (
    <div className={`relative bg-gray-50 text-black min-h-screen flex flex-col ${gradientClasses}`}>
      <CompanyHeader logoUrl={props.logoUrl} companyName={props.companyName} />      
      <main className="flex-grow pt-24 pb-12">
        {layoutType === 'appDownload' && <AppDownloadLayout {...props} />}
        {layoutType === 'notifyMe' && <NotifyMeLayout {...props} />}
      </main>
      <CompanyFooter />
    </div>
  );
}


export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const companyData = await getCompanyData(slug);

  if (!companyData) {
    notFound();
  }

  return <PageContent companyData={companyData} />;
}


export async function generateStaticParams() {
  return companyPagesData.map((page) => ({
    slug: page.slug,
  }));
}
