'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[--color-brand-bg]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md flex justify-center">
          <SignUp 
            routing="path"
            path="/signup"
            signInUrl="/login"
            fallbackRedirectUrl="/"
            appearance={{
              variables: {
                colorPrimary: '#1D4ED8',
                colorBackground: '#ffffff',
                colorText: '#1f2937',
                colorTextSecondary: '#4b5563',
                borderRadius: '1rem',
              },
              elements: {
                card: 'shadow-xl border border-gray-100 rounded-3xl overflow-hidden',
                headerTitle: 'text-2xl font-bold text-gray-800',
                headerSubtitle: 'text-gray-500 text-sm mt-1',
                socialButtonsBlockButton: 'border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl transition-all text-sm',
                formButtonPrimary: 'w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-200',
                formFieldInput: 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all text-sm',
                footerActionLink: 'text-blue-600 font-semibold hover:underline',
              }
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
