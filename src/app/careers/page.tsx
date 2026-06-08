'use client';
/* eslint-disable react/no-unescaped-entities */

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Briefcase, Heart, Globe, Users } from 'lucide-react';

export default function CareersPage() {
  const openings = [
    { role: 'Kitchenbay Relations Manager', location: 'New Delhi / Remote', type: 'Full-time', dept: 'Operations' },
    { role: 'Full Stack Developer (Next.js)', location: 'Remote', type: 'Full-time', dept: 'Technology' },
    { role: 'Content & Social Media Lead', location: 'Mumbai / Remote', type: 'Full-time', dept: 'Marketing' },
    { role: 'Logistics & Supply Chain Intern', location: 'New Delhi', type: 'Internship', dept: 'Operations' },
    { role: 'Graphic Designer', location: 'Remote', type: 'Contract', dept: 'Design' },
  ];

  const perks = [
    { icon: <Heart size={24} className="text-red-500" />, title: 'Health Insurance', desc: 'Comprehensive medical, dental, and vision coverage for you and your family.' },
    { icon: <Globe size={24} className="text-blue-600" />, title: 'Remote-First', desc: 'Work from anywhere in India. Flexible hours that respect your lifestyle.' },
    { icon: <Users size={24} className="text-green-600" />, title: 'Kitchenbay Meetups', desc: 'Quarterly trips to Kitchenbay villages across India to connect with our makers.' },
    { icon: <Briefcase size={24} className="text-yellow-600" />, title: 'Growth Budget', desc: '₹25,000 annual learning budget for courses, books, and conferences.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-blue-950 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-yellow-400 font-semibold uppercase tracking-widest text-sm mb-4">Join Our Team</p>
            <h1 className="text-5xl font-bold font-[family-name:var(--font-heading)] mb-6">Build the Future of India's Kitchenbay Economy</h1>
            <p className="text-blue-200 text-xl max-w-2xl mx-auto">At KitchenbayCraft, every role directly impacts the lives of thousands of Kitchenbay families. Come do meaningful work.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Perks */}
          <div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-8 text-center">Why KitchenbayCraft?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {perks.map((perk, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="mb-3">{perk.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{perk.title}</h3>
                  <p className="text-gray-500 text-sm">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Open Roles */}
          <div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-8 text-center">Open Positions</h2>
            <div className="space-y-4">
              {openings.map((job, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow group">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{job.dept}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${job.type === 'Full-time' ? 'bg-green-100 text-green-700' : job.type === 'Internship' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{job.type}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-[--color-brand-accent] transition-colors">{job.role}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">📍 {job.location}</p>
                  </div>
                  <a href="mailto:careers@Kitchenbaycraft.in" className="shrink-0 bg-[--color-brand-accent] text-white font-semibold px-5 py-2.5 rounded-full hover:bg-[--color-brand-accent-hover] transition-colors text-sm">
                    Apply Now
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Don't see your role?</h3>
            <p className="text-gray-500 mb-6">We're always looking for passionate people. Send us your CV and tell us how you'd contribute.</p>
            <a href="mailto:careers@Kitchenbaycraft.in" className="inline-block bg-blue-950 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-900 transition-colors">
              Send Open Application →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
