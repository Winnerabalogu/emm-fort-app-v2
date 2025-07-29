import Link from 'next/link';

const footerLinks = [
    { name: "Privacy policy", href: "/" },
    { name: "FAQ", href: "/" },
    { name: "Email Us", href: "/" },
]

const CompanyFooter = () => {
  return (
    <footer className="w-full py-6">
      <div className="container mx-auto px-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8 text-sm text-gray-500">
        {footerLinks.map(link => (
            <Link key={link.name} href={link.href} className="hover:text-black transition-colors">
                {link.name}
            </Link>
        ))}
      </div>
    </footer>
  );
};

export default CompanyFooter;