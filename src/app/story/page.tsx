import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function StoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans">
      <Navbar />
      <main className="flex-1">
        <div className="bg-brand-card py-20 text-center px-4 border-b border-gray-100">
          <span className="text-brand-accent text-sm font-semibold tracking-[0.15em] uppercase mb-4 block">Our Story</span>
          <h1 className="font-serif text-5xl font-bold text-brand-text mb-6">Preserving Heritage, <br/> Empowering Artisans</h1>
          <p className="text-brand-muted max-w-2xl mx-auto text-lg">
            We are on a mission to revive traditional Indian craftsmanship and bring authentic, ethically sourced products to your modern home.
          </p>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-20 text-brand-text text-lg leading-relaxed space-y-6">
          <p>
            It all started with a simple realization: the beautiful, sustainable, and culturally rich crafts of India were slowly disappearing, replaced by mass-produced alternatives. 
          </p>
          <p>
            We traveled across the country, from the terracotta pottery villages of Rajasthan to the handloom weaving centers of Gujarat, to connect directly with master artisans. By eliminating middlemen, we ensure that these talented creators receive fair compensation for their incredible work.
          </p>
          <img src="https://images.unsplash.com/photo-1520625399580-bfae3489e217?q=80&w=1200&auto=format&fit=crop" alt="Artisan making pottery" className="w-full rounded-2xl shadow-lg my-12 object-cover aspect-video" />
          <p>
            Today, our platform supports over 500 artisan families across 12 states. Every product you purchase not only brings a piece of history into your home but also helps keep these ancient traditions alive for future generations.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
