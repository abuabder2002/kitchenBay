import type { Metadata } from 'next';
import { Playfair_Display, Nunito_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cartContext';
import { WishlistProvider } from '@/lib/wishlistContext';
import { ProductsProvider } from '@/lib/productsContext';
import { AuthProvider } from '@/lib/authContext';
import { OrdersProvider } from '@/lib/ordersContext';
import { NextAuthProvider } from '@/components/Providers';
import CartDrawer from '@/components/CartDrawer';
import { SpeedInsights } from '@vercel/speed-insights/next';

const playfair = Playfair_Display({ 
  weight: ['400', '500', '600', '700', '800', '900'], 
  subsets: ['latin'], 
  variable: '--font-heading' 
});

const nunitoSans = Nunito_Sans({ 
  weight: ['300', '400', '600', '700'], 
  subsets: ['latin'], 
  variable: '--font-body' 
});

export const metadata: Metadata = {
  title: 'Artisan Craft — Premium Handcrafted Home Decor',
  description: 'Ethically sourced. Artisan-made. Authentically Indian.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${nunitoSans.variable} font-[family-name:var(--font-body)] bg-[--color-brand-bg] text-[--color-brand-text] antialiased selection:bg-[--color-brand-accent] selection:text-white`}>
        <NextAuthProvider>
          <AuthProvider>
            <ProductsProvider>
              <WishlistProvider>
                <CartProvider>
                  <OrdersProvider>{children}</OrdersProvider>
                  <CartDrawer />
                </CartProvider>
              </WishlistProvider>
            </ProductsProvider>
          </AuthProvider>
        </NextAuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
