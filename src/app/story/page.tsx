import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function StoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[--color-brand-bg]">
      <Navbar />
      <main className="flex-1 w-full pb-24">
        
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] bg-black w-full overflow-hidden">
           <Image 
             src="/artisan_kitchenware_hero.png" 
             alt="Our Traditional Indian Kitchenware" 
             fill 
             className="object-cover opacity-70"
             priority
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
           <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <span className="text-[--color-brand-accent-yellow] text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-6 block">Our Story</span>
              <h1 className="text-5xl md:text-7xl font-bold font-[family-name:var(--font-heading)] text-white max-w-4xl leading-tight">
                Rooted in Heritage.<br/> Forged for Your Kitchen.
              </h1>
           </div>
        </section>

        {/* Mission Statement */}
        <section className="py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <span className="text-[--color-brand-accent] text-sm font-bold tracking-[0.2em] uppercase mb-8 block">The Philosophy</span>
           <p className="text-2xl md:text-4xl font-[family-name:var(--font-heading)] text-[--color-brand-text] leading-relaxed max-w-4xl mx-auto">
             "We believe that a kitchen is the heart of a home, and food is our first medicine. Our mission is to revive the lost art of traditional Indian cookware—bringing the authentic health benefits of Kansa, Copper, and Cast Iron back to the modern dining table."
           </p>
        </section>

        {/* Craftsmanship Section */}
        <section className="py-24 bg-white border-y border-[--color-brand-border]">
           <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center gap-16">
                 <div className="flex-1 relative w-full aspect-[4/5] md:aspect-square">
                    <Image 
                      src="/artisan_making_cookware.png" 
                      alt="Artisan hammering metal" 
                      fill 
                      className="object-cover rounded-sm shadow-xl"
                    />
                 </div>
                 <div className="flex-1 lg:pl-12">
                    <span className="text-[--color-brand-accent] text-sm font-bold tracking-[0.2em] uppercase mb-6 block">The Process</span>
                    <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-8 leading-tight">
                       Perfection Takes Patience
                    </h2>
                    <p className="text-lg text-[--color-brand-muted] mb-6 leading-relaxed">
                       In an era of Teflon and factory-stamped aluminum, we choose the slow path. Every utensil in our collection is born from raw, elemental materials—forged in roaring fires, hammered tirelessly by hand, and polished to a flawless finish by master artisans. 
                    </p>
                    <p className="text-lg text-[--color-brand-muted] leading-relaxed">
                       There are no assembly lines here. We rely on the traditional knowledge of *Kalai* (tin-lining) and hand-seasoning that has been passed down through generations. The subtle hammer marks on your brass pot aren't imperfections; they are the very soul of authenticity and human touch.
                    </p>
                 </div>
              </div>
           </div>
        </section>

        {/* Impact Section */}
        <section className="py-24 bg-[--color-brand-top-bar] text-white">
           <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <span className="text-[--color-brand-accent-yellow] text-sm font-bold tracking-[0.2em] uppercase mb-6 block">Our Impact</span>
              <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] mb-16 leading-tight max-w-3xl mx-auto">
                 Empowering Artisan Clusters Across India
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                 <div className="flex flex-col items-center">
                    <div className="text-6xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-accent-yellow] mb-4">500+</div>
                    <h3 className="text-lg font-bold uppercase tracking-widest mb-2">Artisan Families</h3>
                    <p className="text-[--color-brand-bg]/70 text-sm">Directly supported in rural craft clusters.</p>
                 </div>
                 <div className="flex flex-col items-center">
                    <div className="text-6xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-accent-yellow] mb-4">100%</div>
                    <h3 className="text-lg font-bold uppercase tracking-widest mb-2">Fair Trade</h3>
                    <p className="text-[--color-brand-bg]/70 text-sm">Eliminating middlemen to ensure fair wages.</p>
                 </div>
                 <div className="flex flex-col items-center">
                    <div className="text-6xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-accent-yellow] mb-4">8</div>
                    <h3 className="text-lg font-bold uppercase tracking-widest mb-2">Heritage Metals</h3>
                    <p className="text-[--color-brand-bg]/70 text-sm">Including Kansa, Copper, Iron, and Brass.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* The Materials */}
        <section className="py-24 bg-[--color-brand-bg]">
           <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row-reverse items-center gap-16">
                 <div className="flex-1 relative w-full aspect-[4/5] md:aspect-square">
                    <Image 
                      src="/artisan_kitchenware.png" 
                      alt="Handcrafted Indian Cookware" 
                      fill 
                      className="object-cover rounded-sm shadow-xl"
                    />
                 </div>
                 <div className="flex-1 lg:pr-12">
                    <span className="text-[--color-brand-accent] text-sm font-bold tracking-[0.2em] uppercase mb-6 block">The Essence</span>
                    <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] text-[--color-brand-text] mb-8 leading-tight">
                       Wisdom of the Earth
                    </h2>
                    <p className="text-lg text-[--color-brand-muted] mb-6 leading-relaxed">
                       Our ancestors understood the science of wellness long before modern laboratories existed. They cooked in heavy cast iron to naturally fortify food with iron, stored drinking water in pure copper overnight to eliminate bacteria, and served meals on Kansa (bronze) to balance the three doshas.
                    </p>
                    <p className="text-lg text-[--color-brand-muted] leading-relaxed">
                       By reintroducing these elemental materials—Bronze, Brass, Copper, Cast Iron, and Kalchatti (Soapstone)—we aren't just selling beautiful cookware. We are inviting the profound, healing power of ancient Ayurvedic wisdom back into your daily life.
                    </p>
                 </div>
              </div>
           </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
