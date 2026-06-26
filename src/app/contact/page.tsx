'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MapPin, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Your message has been sent successfully.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.error || 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonColor: '#d33',
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to send message. Please check your connection.',
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans">
      <Navbar />
      <main className="flex-1">
        <div className="bg-brand-card py-12 md:py-20 text-center px-4 border-b border-gray-100">
          <span className="text-brand-accent text-sm font-semibold tracking-[0.15em] uppercase mb-4 block">Get In Touch</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-text mb-6">Contact Us</h1>
          <p className="text-brand-muted max-w-2xl mx-auto text-base md:text-lg">
            We&apos;d love to hear from you. Reach out with any questions, support requests, or just to say hello.
          </p>
        </div>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <div>
              <h2 className="font-serif text-3xl font-bold text-brand-text mb-8">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-brand-card border border-gray-100 rounded px-4 py-3 focus:ring-2 focus:ring-brand-accent outline-none transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-brand-card border border-gray-100 rounded px-4 py-3 focus:ring-2 focus:ring-brand-accent outline-none transition-shadow"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-brand-card border border-gray-100 rounded px-4 py-3 focus:ring-2 focus:ring-brand-accent outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-2">Message</label>
                  <textarea
                    rows={5}
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-brand-card border border-gray-100 rounded px-4 py-3 focus:ring-2 focus:ring-brand-accent outline-none transition-shadow"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 bg-brand-accent hover:bg-opacity-90 text-white font-medium px-8 py-3.5 rounded transition-colors w-full sm:w-auto shadow-md disabled:opacity-70"
                >
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            <div className="bg-brand-card p-6 md:p-10 rounded-2xl border border-gray-100 h-fit shadow-sm">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-brand-text mb-8">Contact Information</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="text-brand-accent" size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text mb-1">Email Us</h3>
                    <p className="text-brand-muted leading-relaxed">
                      kitchenbaypvtltd@gmail.com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="text-brand-accent" size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-text mb-1">Our Location</h3>
                    <p className="text-brand-muted leading-relaxed">
                      Kitchenbay Private Limited<br />
                      19/A, Line Street<br />
                      Attur, Salem (DT)<br />
                      Tamil Nadu - 636102
                    </p>
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
