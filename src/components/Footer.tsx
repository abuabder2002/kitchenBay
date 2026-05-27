import Link from 'next/link';
import Image from 'next/image';
import { Smartphone } from 'lucide-react';
import logoImg from '../images/logo.jpeg';

const socialIcons = [
  { label: 'Facebook', svg: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> },
  { label: 'Instagram', svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="1.5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" strokeWidth="1.5" strokeLinecap="round" /></> },
  { label: 'YouTube', svg: <><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" strokeWidth="1.5" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></> },
];

export default function Footer() {
  return (
    <footer className="w-full flex flex-col border-t-4 border-yellow-400">
      {/* TOP FOOTER */}
      <div className="bg-blue-950 text-white py-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            
            {/* Col 1 - Brand */}
            <div className="flex flex-col gap-4">
              <Link href="/">
                <Image src={logoImg} alt="Brand Logo" width={180} height={40} className="object-contain h-10 w-auto invert brightness-0" />
              </Link>
              <p className="text-sm text-blue-100/80">
                India's Premium Destination for Authentic Handcrafted Kitchenware, Dining & Traditional Home Décor
              </p>
              <div className="flex items-center gap-3 mt-2">
                {socialIcons.map((item) => (
                  <a key={item.label} href={`https://${item.label.toLowerCase()}.com/artisancraft`} target="_blank" rel="noopener noreferrer" aria-label={item.label} className="w-8 h-8 rounded-full border border-blue-800 flex items-center justify-center hover:bg-yellow-400 hover:border-yellow-400 hover:text-blue-950 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">{item.svg}</svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2 - Company */}
            <div>
              <h4 className="font-bold mb-4 uppercase text-sm text-yellow-400">Company</h4>
              <ul className="flex flex-col gap-2 text-sm text-blue-200/80">
                {['About Us', 'Careers', 'Press', 'Blog', 'Store Locator'].map(link => (
                  <li key={link}><Link href={`/${link.toLowerCase().replace(/ /g, '-')}`} className="hover:text-yellow-400 transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>

            {/* Col 3 - Help */}
            <div>
              <h4 className="font-bold mb-4 uppercase text-sm text-yellow-400">Help</h4>
              <ul className="flex flex-col gap-2 text-sm text-blue-200/80">
                {['FAQ', 'Track Order', 'Returns & Refunds', 'Contact Us', 'Sitemap'].map(link => (
                  <li key={link}><Link href={`/${link.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="hover:text-yellow-400 transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>

            {/* Col 4 - Policies */}
            <div>
              <h4 className="font-bold mb-4 uppercase text-sm text-yellow-400">Policies</h4>
              <ul className="flex flex-col gap-2 text-sm text-blue-200/80">
                {['Privacy Policy', 'Terms of Use', 'Cookie Policy', 'GST Invoice'].map(link => (
                  <li key={link}><Link href={`/${link.toLowerCase().replace(/ /g, '-')}`} className="hover:text-yellow-400 transition-colors">{link}</Link></li>
                ))}
              </ul>
            </div>

            {/* Col 5 - Get the App */}
            <div>
              <h4 className="font-bold mb-4 uppercase text-sm text-yellow-400">Get the App</h4>
              <p className="text-sm text-blue-200/80 mb-4">Download our app for exclusive deals</p>
              <div className="flex flex-col gap-3">
                <button suppressHydrationWarning className="flex items-center justify-center gap-2 bg-white text-blue-950 rounded-full py-2 px-4 hover:bg-yellow-400 hover:text-blue-950 transition-colors w-40 font-semibold shadow-sm">
                  <Smartphone size={18} />
                  <span className="text-sm font-bold">App Store</span>
                </button>
                <button suppressHydrationWarning className="flex items-center justify-center gap-2 bg-white text-blue-950 rounded-full py-2 px-4 hover:bg-yellow-400 hover:text-blue-950 transition-colors w-40 font-semibold shadow-sm">
                  <Smartphone size={18} />
                  <span className="text-sm font-bold">Play Store</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div className="bg-[#071120] py-4">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-blue-300/60 text-sm">
            © 2026 ArtisanCraft. All Rights Reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {['Razorpay', 'UPI', 'Visa', 'Mastercard', 'NetBanking'].map(method => (
              <span key={method} className="bg-blue-950/80 text-blue-200/80 border border-blue-900/50 text-xs px-3 py-1 rounded-full">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
