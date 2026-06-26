import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy & Cookie Policy | Kitchenbay',
  description: 'Understand how Kitchenbay collects, uses, and safeguards your personal information and data.',
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: 'Scope',
      content: 'This policy applies to the treatment of personally identifiable information ("Personal Information") collected by Kitchenbay when you access or use our website. It does not apply to third-party websites or companies that we do not own, control, or manage—even if you access them through links on our website.'
    },
    {
      title: 'What Personal Information Do We Collect?',
      content: (
        <>
          <p className="mb-4">You may browse our website without providing personal information. However, for certain activities such as placing an order, registering an account, or subscribing to communications, we may collect the following data:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Shipping address</li>
            <li>Purchase history</li>
            <li>Preferences and interactions on the website</li>
          </ul>
          <p>Some data fields may be marked mandatory. Without providing this information, you may not be able to access or complete certain services.</p>
        </>
      )
    },
    {
      title: 'How Your Personal Information Is Used',
      content: (
        <>
          <p className="mb-4">We collect and use your personal information for the following purposes:</p>
          <ul className="list-decimal pl-6 space-y-2">
            <li>To process your financial transactions and service your orders.</li>
            <li>To respond to customer service queries and requests.</li>
            <li>To provide you with updates about your order, or relevant product and service information.</li>
            <li>To manage your account effectively.</li>
            <li>To keep you informed about special offers, promotions, and product launches.</li>
            <li>To detect or prevent fraud, misuse, or violations of our Terms of Service.</li>
            <li>To personalize your experience with Kitchenbay.</li>
          </ul>
        </>
      )
    },
    {
      title: 'Updating or Deleting Your Information',
      content: (
        <>
          <p className="mb-4">You may access, update, or delete your personal data anytime via the “My Account” section on our website. Some changes may require verification or customer support. We will act on your request within a reasonable time.</p>
          <p className="font-semibold text-gray-800">Note: We do not store your credit or debit card details on our servers.</p>
        </>
      )
    },
    {
      title: 'Sharing with Service Providers',
      content: (
        <>
          <p className="mb-4">Kitchenbay may share personal information with:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Payment processing partners, for billing purposes.</li>
            <li>Logistics and service vendors, to fulfill orders or services.</li>
            <li>Third-party service providers, only for specific services (e.g., marketing or technical support).</li>
          </ul>
          <p className="mb-4">All partners are required to maintain data confidentiality and use it only to perform authorized functions on behalf of Kitchenbay.</p>
          <p className="font-semibold text-gray-800">We do not sell or rent your personal information to any third parties for marketing purposes.</p>
        </>
      )
    },
    {
      title: 'Cookies Policy',
      content: (
        <>
          <p className="mb-4">Cookies are small files placed on your device to enhance your web experience. They help us:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Understand user behavior and traffic patterns.</li>
            <li>Improve website functionality and personalization.</li>
            <li>Remember preferences for future visits.</li>
          </ul>
          <p className="mb-4 font-semibold">You have control:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>You can accept or decline cookies through your browser settings.</li>
            <li>Most browsers accept cookies by default, but disabling them may limit certain website features.</li>
          </ul>
          <p>Cookies do not give us access to your computer or any information beyond what you choose to share.</p>
        </>
      )
    },
    {
      title: 'Data Security',
      content: (
        <>
          <p className="mb-4">We use secure servers and encryption technologies (such as Transport Layer Security - TLS) to protect your data during transmission and storage. Access to your personal data is restricted to authorized Kitchenbay personnel.</p>
          <p>While we implement reasonable safeguards, no method of electronic transmission or storage is 100% secure. You acknowledge this inherent risk when using our services.</p>
        </>
      )
    },
    {
      title: 'Policy Updates',
      content: 'This Privacy & Cookie Policy may be updated periodically. Any material changes will be communicated via the website or through direct communication, where required.'
    },
    {
      title: 'Contact Us',
      content: (
        <>
          <p className="mb-4">If you have questions, concerns, or feedback related to this Privacy Policy, feel free to contact:</p>
          <div className="space-y-2">
            <p>📧 <strong>Email:</strong> <a href="mailto:kitchenbaypvtltd@gmail.com" className="text-blue-600 hover:underline">kitchenbaypvtltd@gmail.com</a></p>
            <p>🏢 <strong>Address:</strong> Kitchenbay Private Limited, 19/A, Line Street, Attur, Salem (DT) - 636102</p>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <div className="bg-blue-950 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">Privacy & Cookie Policy</h1>
            <p className="text-blue-200 text-lg">Last updated: May 2026</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-8">
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              At Kitchenbay Internet Private Limited (“Kitchenbay,” “we,” “us”), we understand your concerns about online privacy and security while browsing or shopping on our website. We are committed to safeguarding your personal information and ensuring transparency in how it is used.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Please read the following to understand our Privacy & Cookie Policy.
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[family-name:var(--font-heading)]">{section.title}</h2>
                <div className="text-gray-600 leading-relaxed">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
