import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation & Refund Policy | Kitchenbay',
  description: 'Understand our 48-hour return policy, cancellation procedures, and refund guidelines.',
};

export default function ReturnsRefundsPage() {
  const sections = [
    {
      title: '48-Hour Return Policy',
      content: (
        <>
          <p className="mb-4">We offer you complete peace of mind while ordering at Kitchenbay – you can return all eligible items within 48 hours of receipt of goods.</p>
          <p className="mb-4">We care about your safety and hygiene, and we&apos;re happy to accept returns on unused cookware products. Please ensure that the product is unused and that the tags, boxes, and other packaging are intact.</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>For stainless steel cookware, refunds or replacements are only available for issues like size mismatches, dents, or broken/missing parts.</li>
            <li>We do not allow refunds or replacements for correctly delivered products. Please ensure you check all product specifications before purchasing to avoid any inconvenience.</li>
          </ul>
          <p className="mb-4">This policy helps keep all our products in perfect condition. We hope you understand and cooperate with us on this. If you have any questions or need more information, our friendly customer service team is ready to help.</p>
          <p>Thank you for choosing us and for supporting our commitment to a safe and healthy community. For pre-paid orders, we will reverse the payment to the source. In the case of COD, we will do a NEFT payment in the registered name of the customer.</p>
        </>
      )
    },
    {
      title: 'Damaged, Wrong, or Missing Items',
      content: (
        <>
          <p className="mb-4 font-semibold">What should I do if I receive a damaged item, wrong product or missing units in my order?</p>
          <p className="mb-4">If an item is damaged, missing, or incorrect, please send a photo of the outer packaging and products received to our customer care within 48 hours of receipt of the product.</p>
          <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p><strong>Email:</strong> <a href="mailto:kitchenbaypvtltd@gmail.com" className="text-blue-600 hover:underline">kitchenbaypvtltd@gmail.com</a></p>
          </div>
          <p>We will issue either a full refund or send the same item in exchange, as per your request.</p>
        </>
      )
    },
    {
      title: 'Cancellation Policy',
      content: (
        <>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>You can cancel an order within 2 to 3 hours of placing it.</li>
            <li>We will only accept cancellation requests within this window from the time the order is placed.</li>
            <li>Orders cannot be cancelled once they have been shipped, even if within the cancellation window.</li>
            <li>Address changes are also allowed only if the order has not been shipped.</li>
            <li>You may also refuse to accept the parcel at the time of delivery. Orders will not be returned once delivered.</li>
          </ul>
        </>
      )
    },
    {
      title: 'Refund Policy',
      content: (
        <>
          <p className="mb-4">For Credit Card/Debit Card/Net banking transactions, the money will be refunded back to the payment method/account originally used to make the purchase. However, shipping charges will not be refunded, except when a product is received in damaged condition and the issue is verified and authorized by Kitchenbay.</p>
          <p className="mb-4">For COD (Cash on Delivery) transactions, cash refunds are not possible since courier partners do not facilitate cash returns. In such cases, we will issue store credit equivalent to the product value, which can be used for future purchases. A coupon code will be generated and shared once the returned product is received at our facility.</p>
          <p className="font-semibold mb-2">Shipping costs (both ways) will be deducted in the following situations:</p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Incorrect or outdated delivery address provided</li>
            <li>After 3 failed delivery attempts by the logistics company</li>
            <li>Package refused by the recipient</li>
          </ul>
          <p className="font-semibold mb-2">No refunds will be issued in the following cases:</p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>Returned products are used</li>
            <li>Returned products arrive damaged when shipped by the customer</li>
            <li>Package is lost in transit when returned by the customer</li>
            <li>For international orders, if the customer refuses to pay customs duties or statutory charges levied by the destination country — in such cases, the package will be forfeited</li>
          </ul>
          <p className="font-semibold text-gray-800">Note: Refunds will be initiated only after we receive the returned item and complete a quality check. Bank refunds usually take 10–12 business days to be processed.</p>
          <div className="mt-6">
            <h3 className="font-bold mb-2">Will I get a refund if I don&apos;t get a replacement/exchange as requested?</h3>
            <p>Replacements/Exchanges are subject to the availability of stock. If the product is out of stock or a replacement/exchange cannot be issued, a full refund will be provided upon successful pick-up of the product at no extra cost.</p>
          </div>
        </>
      )
    },
    {
      title: 'Return Pickup Policy',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Once you raise a return request, our team will contact you to understand the specific issue and assist you accordingly. If the return is due to size mismatch or a damaged product, our team will guide you through the return process as per our policy. In such cases, you will need to courier the product via your nearest post office, and Kitchenbay will be responsible for the return shipping charges.</li>
          <li>For certain other products, the customer may need to arrange return shipping at their own cost and responsibility.</li>
          <li>The mode of return (pickup or self-shipping) will be communicated to the customer at the time of the return request.</li>
          <li>For returns, once your request is raised and approved by our team, you can pack the product and courier it through the nearest post office.</li>
        </ul>
      )
    },
    {
      title: 'Shipping Policy',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>We have partnered with India Post for fast and reliable delivery across India.</li>
          <li>All our products are shipped through India Post to ensure maximum reach, even in remote areas.</li>
          <li>On average, orders are shipped within 5 business days. Some made-to-order items may take longer, and timelines will be specified on the product page.</li>
          <li>Once shipped, a tracking number will be emailed to you.</li>
          <li>Delivery occurs Monday through Saturday, 9 AM to 7 PM. Public holidays and Sundays are not considered working days.</li>
        </ul>
      )
    },
    {
      title: 'FAQs on Shipping and Tracking',
      content: (
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Q. How will I know that my order has been placed?</p>
            <p>A. Once you have ordered from our website, you will receive a confirmation email and SMS. We pack and ship all orders within 24 hours from your nearest warehouse. You will receive a notification on email and SMS when your order is Dispatched. The notification will have tracking link. You can get Live updates with the link.</p>
          </div>
          <div>
            <p className="font-semibold">Q. How to track my order?</p>
            <p>A. You can track your order using the tracking link sent to your email. Enter your Order ID or Tracking ID and click the Search icon.</p>
          </div>
          <div>
            <p className="font-semibold">Q. What is the expected delivery time?</p>
            <p>A. Typically, your Order will be delivered within 4-7 days from the date of placing order. Delivery time may vary depending upon the shipping address.</p>
          </div>
          <div>
            <p className="font-semibold">Q. How will I know the status of my product delivery?</p>
            <p>A. You will receive a notification of ‘Out for Delivery’ in email and SMS with the courier partner details. On successful delivery you will receive a notification of Delivery Feedback Request in email and SMS. Please take a minute to rate your experience. It helps us to improve our services.</p>
          </div>
          <div>
            <p className="font-semibold">Q. Do you deliver outside India?</p>
            <p>A. No. Currently, we don’t deliver products outside India.</p>
          </div>
        </div>
      )
    },
    {
      title: 'FAQs about Cast Iron Cookware',
      content: (
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Q. What is cast iron cookware?</p>
            <p>A. Cast iron cookware is a range of cooking utensils that is made of natural materials. Cast iron utensils are made by pouring melted iron into different moulds to bring the desired shape of cookware. Actually, cast iron material is made up of iron-carbon alloy with more than 2% of carbon in it.</p>
          </div>
          <div>
            <p className="font-semibold">Q. What is the difference between cast iron and iron cookware?</p>
            <p>A. Cast iron utensils are heavier and tougher than sheet iron cookware. They won&apos;t easily get scratched or damaged. Once you use and season cast iron cookware regularly, they get naturally non-stick finish. Nothing sticks to them, making it easy to cook and clean. Cast iron lasts longer and you can even pass it down to generations.</p>
          </div>
          <div>
            <p className="font-semibold">Q. Does cast iron cookware rust?</p>
            <p>A. Yes, if exposed to water for a prolonged period of time. Always wash your cookware after use. Wipe dry your entire cast iron cookware well. Season it to get back the natural non-stick finish.</p>
          </div>
          <div>
            <p className="font-semibold">Q. Why does cast iron weigh so much?</p>
            <p>A. Cast iron cookware is sturdy, thick and has a durable body. That makes it ideal for rough and tough daily cooking. Owing to heavy-gauge construction, the cast iron kadai can resist damage, scratches, chipping and extreme heat. It endures high heat and extreme temperatures, without bending or breaking.</p>
          </div>
          <div>
            <p className="font-semibold">Q. Is cast iron cookware non-stick?</p>
            <p>A. Cast iron cookware becomes non-stick naturally after seasoning. Repeated usage and regular seasoning maintains this natural non-stick finish.</p>
          </div>
          <div>
            <p className="font-semibold">Q. What should I do if I notice rust on my cast iron cookware?</p>
            <p>A. Here is what you can do if you see rust on your cast iron cookware:<br />
              1. Make a solution of half cup water &amp; half cup vinegar.<br />
              2. Spray this solution on rusted cookware.<br />
              3. Allow it to rest for a maximum of 15 minutes. The cookware will corrode if left beyond 30 minutes.<br />
              4. Scrub the rust away with a metal scrubber.<br />
              5. Wash the surface with warm, soapy water.<br />
              6. Wipe it dry &amp; season it. Your cookware is now good to use.
            </p>
          </div>
          <div>
            <p className="font-semibold">Q. How do I prevent my cast iron cookware from rusting?</p>
            <p>A. Do not soak your cast iron cookware in water. Always wipe it completely dry with a cloth after every wash. Post wash, apply a thin layer of cooking oil to the entire cookware surface. After applying oil, you can store the cookware until next use.</p>
          </div>
          <div>
            <p className="font-semibold">Q. Is it necessary to season my cast iron cookware regularly to prevent rust?</p>
            <p>A. It is recommended to season your cookware after every wash. The cookware surface when treated with oil gives a natural, non-sticky finish. It helps prevent rusting too. If your cast iron cookware becomes dull, grey or rusty, re-seasoning will make it as good as new.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <div className="bg-blue-950 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">Cancellation & Refund Policy</h1>
            <p className="text-blue-200 text-lg">Everything you need to know about our returns and refunds.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
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
