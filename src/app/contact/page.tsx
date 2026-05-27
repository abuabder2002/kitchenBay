import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans">
      <Navbar />
      <main className="flex-1">
        <div className="bg-brand-card py-20 text-center px-4 border-b border-gray-100">
          <span className="text-brand-accent text-sm font-semibold tracking-[0.15em] uppercase mb-4 block">Get In Touch</span>
          <h1 className="font-serif text-5xl font-bold text-brand-text mb-6">Contact Us</h1>
          <p className="text-brand-muted max-w-2xl mx-auto text-lg">
            We'd love to hear from you. Reach out with any questions, wholesale inquiries, or just to say hello.
          </p>
        </div>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="font-serif text-3xl font-bold text-brand-text mb-8">Send a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">First Name</label>
                    <input type="text" className="w-full bg-brand-card border border-gray-100 rounded px-4 py-3 focus:ring-2 focus:ring-brand-accent outline-none transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">Last Name</label>
                    <input type="text" className="w-full bg-brand-card border border-gray-100 rounded px-4 py-3 focus:ring-2 focus:ring-brand-accent outline-none transition-shadow" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-2">Email Address</label>
                  <input type="email" className="w-full bg-brand-card border border-gray-100 rounded px-4 py-3 focus:ring-2 focus:ring-brand-accent outline-none transition-shadow" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-2">Message</label>
                  <textarea rows={5} className="w-full bg-brand-card border border-gray-100 rounded px-4 py-3 focus:ring-2 focus:ring-brand-accent outline-none transition-shadow"></textarea>
                </div>
                <button type="submit" className="bg-brand-accent hover:bg-opacity-90 text-white font-medium px-8 py-3.5 rounded transition-colors w-full sm:w-auto shadow-md">
                  Send Message
                </button>
              </form>
            </div>

            <div className="bg-brand-card p-10 rounded-2xl border border-gray-100 h-fit shadow-sm">
              <h2 className="font-serif text-3xl font-bold text-brand-text mb-8">Contact Information</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="text-brand-accent" size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text mb-1">Our Studio</h3>
                    <p className="text-brand-muted leading-relaxed">123 Artisan Village Road<br />Jayanagar, Bangalore<br />Karnataka 560041</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="text-brand-accent" size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text mb-1">Email Us</h3>
                    <p className="text-brand-muted leading-relaxed">namaste@Kitchenbay the home needs.com<br />support@Kitchenbay the home needs.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <Phone className="text-brand-accent" size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text mb-1">Call Us</h3>
                    <p className="text-brand-muted leading-relaxed">+91 98765 43210<br />Mon-Fri, 9am to 6pm IST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
