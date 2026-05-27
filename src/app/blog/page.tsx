import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const posts = [
    { title: 'The Art of Terracotta: Cooking in Clay', date: 'Oct 12, 2026', category: 'Craftsmanship', img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=600&auto=format&fit=crop' },
    { title: 'Why Copper Water is Good For You', date: 'Sep 28, 2026', category: 'Wellness', img: 'https://images.unsplash.com/photo-1620063625407-7429188e1a14?q=80&w=600&auto=format&fit=crop' },
    { title: 'A Journey Through the Looms of Kutch', date: 'Sep 15, 2026', category: 'Travel', img: 'https://images.unsplash.com/photo-1606148386408-251cce684e26?q=80&w=600&auto=format&fit=crop' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans">
      <Navbar />
      <main className="flex-1">
        <div className="bg-brand-card py-20 text-center px-4 border-b border-gray-100">
          <span className="text-brand-accent text-sm font-semibold tracking-[0.15em] uppercase mb-4 block">Journal</span>
          <h1 className="font-serif text-5xl font-bold text-brand-text mb-6">Our Blog</h1>
          <p className="text-brand-muted max-w-2xl mx-auto text-lg">
            Stories of craft, culture, and sustainable living.
          </p>
        </div>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-10">
            {posts.map((post, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-md bg-brand-card">
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wider mb-3">
                  <span className="text-brand-accent">{post.category}</span>
                  <span className="text-brand-muted">{post.date}</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-brand-text mb-4 group-hover:text-brand-accent transition-colors">{post.title}</h3>
                <Link href="#" className="inline-flex items-center text-brand-text group-hover:text-brand-accent font-medium transition-colors">
                  Read Article <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
