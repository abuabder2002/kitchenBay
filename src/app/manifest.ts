import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KitchenBay — Premium Handcrafted Kitchenware',
    short_name: 'KitchenBay',
    description:
      "India's premium destination for authentic handcrafted kitchenware, cookware, dining & home décor.",
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F2E8',
    theme_color: '#4A3B32',
    orientation: 'portrait-primary',
    categories: ['shopping', 'lifestyle', 'food'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '64x64 32x32 16x16',
        type: 'image/x-icon',
      },
    ],
  };
}
