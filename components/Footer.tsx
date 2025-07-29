import Link from 'next/link';
import Image from 'next/image'

const companyLinks = [
  { name: "EMM-Fort Nigeria", href: "/companies/nigeria" },
  { name: "EMM-Fort Logistics", href: "/companies/logistics" },
  { name: "EMM-Fort Realty", href: "/companies/realty" },
  { name: "EMM-Fort events", href: "/companies/events" },
  { name: "EMM-Fort Consulting", href: "/companies/consulting" },
  { name: "EMM-Fort Affiliate Sales", href: "/companies/affiliate-sales" },
];

const groupLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/" },
    { name: "Ask me", href: "/" },
    { name: "Contact Us", href: "/" },
];

const Footer = () => {
  return (
    <footer className="bg-footer-bg text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to get started?</h2>
          <Link href="/" className="bg-white text-black font-semibold py-3 px-8 rounded-full text-lg hover:bg-brand-orange hover:text-white transition-colors">
            Contact Us
          </Link>
        </div>

        {/* Links and Logo Section */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left gap-8">
            <Link href="/" className="flex items-center gap-2">          
          <Image 
            src="/logos/og-logo.png"
            alt="EMM-Fort Logo"
            width={60} 
            height={60}
            className="w-auto"
          />          
          <span className="text-4xl font-bold text-white">
            <span className="text-brand-orange">EM</span>M-Fort
          </span>
        </Link>

          <div className="flex flex-col sm:flex-row gap-8 md:gap-16">
            <div>
              <h4 className="font-bold text-white mb-3">Our Companies</h4>
              <ul className="space-y-2">
                {companyLinks.map(link => (
                  <li key={link.name}>                    
                    <Link href={link.href} className="text-gray-300 hover-underline-animation">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">EMM-Fort Group</h4>
              <ul className="space-y-2">
                {groupLinks.map(link => (
                    <li key={link.name}>                      
                      <Link href={link.href} className="hover-underline-animation text-white !important">
                        {link.name}
                      </Link>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>        
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p>Copyright @ 2025 EMM-Fort. All rights reserved</p>
          <div className="flex gap-4 mt-4 sm:mt-0">            
            <Link href="/" className="text-gray-300 hover-underline-animation">
              Privacy Policy
            </Link>
            <Link href="/" className="text-gray-300 hover-underline-animation">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;