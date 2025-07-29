import SubsidiaryCard from '../SubsidiaryCard';


interface SubsidiariesProps {
  id?: string;
}
const subsidiariesData = [
  {
    logoUrl: '/logos/supermarket-logo.png',
    title: 'EMM-FORT SUPERMARKET',
    description: 'Pioneering e-commerce in Nigeria with a curated selection of quality grocery products, delivered swiftly to your doorstep.',
    imageUrl: '/images/supermarket.png',
     linkUrl: 'https://emm-fort.com.ng/'
  },
  {
    logoUrl: '/logos/logistics-logo.png',
    title: 'EMM-FORT LOGISTICS',
    description: 'Streamlining global supply chains with efficient, reliable, and tech-driven logistics solutions.',
    imageUrl: '/images/logistics.png',
     linkUrl: '/companies/logistics'
  },
    {
    logoUrl: '/logos/realty-logo.png',
    title: 'EMM-FORT REALTY',
    description: 'Revolutionizing Nigeria\'s property landscape with innovative developments, flexible rental and lease options, and seamless purchase experience.',
    imageUrl: '/images/realty.png',
     linkUrl: '/companies/realty'
  },
   {
    logoUrl: '/logos/events-logo.png',
    title: 'EMM-FORT EVENTS',
    description: 'Elevating experiences and creating unforgettable moments.',
    imageUrl: '/images/events.png',
     linkUrl: '/companies/events'
  },
   {
    logoUrl: '/logos/consulting-logo.png',
    title: 'EMM-FORT CONSULTING',
    description: 'Expert advisors empowering businesses to achieve remarkable growth, through strategic guidance and tailored solutions.',
    imageUrl: '/images/consulting.png',
     linkUrl: '/companies/consulting'
  },
  {
    logoUrl: '/logos/affiliates-logo.png',
    title: 'EMM-FORT AFFLIATE SALES',
    description: 'Unlocking new revenue streams for individuals and businesses through our innovative affiliate marketing programs.',
    imageUrl: '/images/affiliates.png',
     linkUrl: '/auth/register'
  },
];

const Subsidiaries = ({ id }: SubsidiariesProps) => {
  return (
    <section id={id} className="py-16 md:py-24 bg-dark-bg">
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