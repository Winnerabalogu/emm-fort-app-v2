import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const companyLinks = [
  { name: "EMM-Fort Nigeria", href: "/companies/nigeria" },
  { name: "EMM-Fort Logistics", href: "/companies/logistics" },
  { name: "EMM-Fort Realty", href: "/companies/realty" },
  { name: "EMM-Fort Events", href: "/companies/events" },
  { name: "EMM-Fort Consulting", href: "/companies/consulting" },
  { name: "EMM-Fort Affiliate Sales", href: "/companies/affiliate-sales" },
];

const groupLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/#about" },
  { name: "Contact Us", href: "/contact" },
  { name: "Careers", href: "/careers" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Cookie Policy", href: "/cookies" },
];

const CompanyFooter = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        
        {/* CTA Section */}
        <div className="text-center mb-16 border-b border-gray-800 pb-16">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Discover how EMM-Fort Group can help accelerate your growth across multiple industries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started Today
              </Link>
              <Link 
                href="/#companies" 
                className="border-2 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold py-4 px-8 rounded-full transition-all duration-300"
              >
                Explore Our Companies
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">          
              <Image 
                src="/logos/og-logo.png"
                alt="EMM-Fort Logo"
                width={50} 
                height={50}
                className="rounded-lg shadow-lg"
              />          
              <div>
                <span className="text-2xl font-bold text-white">
                  <span className="text-orange-500">EM</span>M-Fort
                </span>
                <p className="text-xs text-gray-500">Building Tomorrow</p>
              </div>
            </Link>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              A diversified group of companies committed to excellence, innovation, and sustainable growth across multiple industries.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <a href="mailto:admin@emmfortgroup.com" className="hover:text-white transition-colors">
                  admin@emmfortgroup.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <a href="tel:+2341234567890" className="hover:text-white transition-colors">
                   +234 (7) 036 082 070
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span>21, Americana street, Ikotun lagos</span>
              </div>
            </div>
          </div>

          {/* Our Companies */}
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">Our Companies</h4>
            <ul className="space-y-3">
              {companyLinks.map(link => (
                <li key={link.name}>                    
                  <Link 
                    href={link.href} 
                    className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors group"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* EMM-Fort Group */}
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">EMM-Fort Group</h4>
            <ul className="space-y-3">
              {groupLinks.map(link => (
                <li key={link.name}>                      
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-orange-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Legal */}
          <div>
            <h4 className="font-bold text-white mb-6 text-lg">Stay Updated</h4>
            <p className="text-gray-400 mb-4 text-sm">
              Subscribe to receive updates about our latest launches and opportunities.
            </p>
            
            <div className="mb-8">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
                />
                <button className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-r-lg transition-colors">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-3">Legal</h5>
              <ul className="space-y-2">
                {legalLinks.map(link => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-gray-300 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              Copyright © {new Date().getFullYear()} EMM-Fort Group. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <span className="text-gray-500 text-sm">Powered by innovation</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CompanyFooter;