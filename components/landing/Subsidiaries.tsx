import SubsidiaryCard from '../SubsidiaryCard';


interface SubsidiariesProps {
  id?: string;
}
const subsidiariesData = [
  {
    logoUrl: '/logos-webp/supermarket-logo.webp',
    title: 'EMM-FORT SUPERMARKET',
    description: 'Pioneering e-commerce in Nigeria with a curated selection of quality grocery products, delivered swiftly to your doorstep.',
    imageUrl: '/images-webp/supermarket.webp',
     linkUrl: 'https://emm-fort.com.ng/'
  },
  {
    logoUrl: '/logos-webp/logistics-logo.webp',
    title: 'EMM-FORT LOGISTICS',
    description: 'Streamlining global supply chains with efficient, reliable, and tech-driven logistics solutions.',
    imageUrl: '/images-webp/logistics.webp',
     linkUrl: '/companies/logistics'
  },
    {
    logoUrl: '/logos-webp/realty-logo.webp',
    title: 'EMM-FORT REALTY',
    description: 'Revolutionizing Nigeria\'s property landscape with innovative developments, flexible rental and lease options, and seamless purchase experience.',
    imageUrl: '/images-webp/realty.webp',
     linkUrl: '/companies/realty'
  },
   {
    logoUrl: '/logos-webp/events-logo.webp',
    title: 'EMM-FORT EVENTS',
    description: 'Elevating experiences and creating unforgettable moments.',
    imageUrl: '/images-webp/events.webp',
     linkUrl: '/companies/events'
  },
   {
    logoUrl: '/logos-webp/consulting-logo.webp',
    title: 'EMM-FORT CONSULTING',
    description: 'Expert advisors empowering businesses to achieve remarkable growth, through strategic guidance and tailored solutions.',
    imageUrl: '/images-webp/consulting.webp',
     linkUrl: '/companies/consulting'
  },
  {
    logoUrl: '/logos-webp/affiliates-logo.webp',
    title: 'EMM-FORT AFFLIATE SALES',
    description: 'Unlocking new revenue streams for individuals and businesses through our innovative affiliate marketing programs.',
    imageUrl: '/images-webp/affiliates.webp',
     linkUrl: '/auth/register'
  },
   {
    logoUrl: '/logos-webp/affiliates-logo.webp',
    title: 'EMM-FORT CREATOR PROGRAM',
    description: 'Empowering content creators to build their brand while earning through our comprehensive creator partnership program.',
    imageUrl: '/creator-bg-webp/content-creator-3.webp',
    linkUrl: '/creator'
  },
];

const Subsidiaries = ({ id }: SubsidiariesProps) => {
  return (
    <section id={id} className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="space-y-12 md:space-y-16 ">
          {subsidiariesData.map((sub, index) => (
            <SubsidiaryCard
              key={sub.title}
              {...sub}
              imagePosition={index % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Subsidiaries;