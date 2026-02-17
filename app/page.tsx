'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import translations from '@/app/translations.json';

type Language = 'en' | 'af' | 'xh';

interface Category {
  id: string;
  name: string;
  nameAf: string;
  nameXh: string;
  image: string;
  href: string;
}

const categories: Category[] = [
  {
    id: 'events',
    name: 'Events',
    nameAf: 'Geleenthede',
    nameXh: 'Iziganeko',
    image: '/categories/events.jpg',
    href: '/events'
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    nameAf: 'Handelsplek',
    nameXh: 'Intsangano',
    image: '/categories/marketplace.jpeg',
    href: '/marketplace'
  },
  {
    id: 'membership',
    name: 'Membership',
    nameAf: 'Lidmaatskap',
    nameXh: 'Ubulungu',
    image: '/categories/membership.jpg',
    href: '/membership'
  },
  {
    id: 'schoolHoliday',
    name: 'School Holiday Program',
    nameAf: 'Skoolvakansie Program',
    nameXh: 'Umkhosi Wezilali',
    image: '/categories/schoolholiday.png',
    href: '/school-holiday'
  },
  {
    id: 'heritage',
    name: 'Heritage Program',
    nameAf: 'Erfenis Program',
    nameXh: 'Ikhaya Lengcali',
    image: '/categories/heritageproject.jpg',
    href: '/heritage'
  },
  {
    id: 'publicity',
    name: 'Publicity',
    nameAf: 'Publisiteit',
    nameXh: 'Isaziso',
    image: '/categories/publicity.jpg',
    href: '/publicity'
  }
];

const taglineWords = {
  en: ['Community', 'Heritage', 'Leadership'],
  af: ['Gemeenskap', 'Erfenis', 'Leierskap'],
  xh: ['Uluntu', 'Inkcubeko', 'Ubunkokheli']
};

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  const t = translations[language];
  const itemsPerPage = isMobile ? 2 : 3;
  const totalSlides = Math.ceil(categories.length / itemsPerPage);

  const visibleCategories = categories.slice(
    currentSlide * itemsPerPage,
    (currentSlide + 1) * itemsPerPage
  );

  const getCategoryName = (category: Category) => {
    if (language === 'af') return category.nameAf;
    if (language === 'xh') return category.nameXh;
    return category.name;
  };

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = 'https://c37f4fdb.sibforms.com/serve/MUIFAKK61xYDABQ-AXEDD3Gfxg60gBJDhoZRcBxVipTAoZ2nNtyBhNUXt11yOb9GptolX8z0PVUKxY7Wsj36YRHBcXelmnbMb4PC8s-xNdRmbL_OLWNjuyzj_Qub4du6_eL75IQ5rYQlJzNVi-7UgcLaSjk5QCEGMd6bKZA3sTYGxZUmInMj2rifqwz0agU5bL_NoYy5xjgjLY66';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div style={{ fontSize: '20px', fontWeight: 'normal', color: '#111827' }}>
            </div>
            <nav className="flex gap-6 items-center">
              <Link href="/" style={{ color: '#2d5016', textDecoration: 'none', fontSize: '15px', fontWeight: 'normal' }}>
                {language === 'en' && 'Home'}
                {language === 'af' && 'Tuis'}
                {language === 'xh' && 'Ikhaya'}
              </Link>
              <Link href="/about" style={{ color: '#111827', textDecoration: 'none', fontSize: '15px', fontWeight: 'normal' }}>
                {language === 'en' && 'About'}
                {language === 'af' && 'Oor'}
                {language === 'xh' && 'Malunga'}
              </Link>
              <Link href="/events" style={{ color: '#111827', textDecoration: 'none', fontSize: '15px', fontWeight: 'normal' }}>
                {language === 'en' && 'Events'}
                {language === 'af' && 'Geleenthede'}
                {language === 'xh' && 'Iziganeko'}
              </Link>
              <Link href="/store" style={{ color: '#111827', textDecoration: 'none', fontSize: '15px', fontWeight: 'normal' }}>
                {language === 'en' && 'Store'}
                {language === 'af' && 'Winkel'}
                {language === 'xh' && 'Inkolo'}
              </Link>
              <Link href="/membership" style={{ color: '#111827', textDecoration: 'none', fontSize: '15px', fontWeight: 'normal' }}>
                {language === 'en' && 'Membership'}
                {language === 'af' && 'Lidmaatskap'}
                {language === 'xh' && 'Ubulungu'}
              </Link>
              <Link href="/contact" style={{ color: '#111827', textDecoration: 'none', fontSize: '15px', fontWeight: 'normal' }}>
                {language === 'en' && 'Contact'}
                {language === 'af' && 'Kontak'}
                {language === 'xh' && 'Xhomekela'}
              </Link>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  fontWeight: 'normal'
                }}
              >
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="xh">Xhosa</option>
              </select>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '32px',
            fontFamily: 'Georgia, serif'
          }}>
            {t.welcome}
          </h1>

          {/* Tagline Words in Boxes */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            {taglineWords[language].map((word, idx) => (
              <div key={idx} style={{
                backgroundColor: '#ffffff',
                border: '2px solid #2d5016',
                color: '#2d5016',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: '0 2px 8px rgba(45, 80, 22, 0.1)'
              }}>
                {word}
              </div>
            ))}
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="relative mb-12 px-20" style={{ marginTop: '80px' }}>
          <div className={`grid gap-6 ${itemsPerPage === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {visibleCategories.map((category) => (
              <Link key={category.id} href={category.href}>
                <div className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105" style={{ width: '100%', height: '380px' }}>
                  <img
                    src={category.image}
                    alt={getCategoryName(category)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-all flex items-end p-4">
                    <h2 className="text-white font-bold text-lg">
                      {getCategoryName(category)}
                    </h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalSlides > 1 && (
            <>
              {currentSlide > 0 && (
                <button
                  onClick={handlePrevious}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-all"
                  aria-label="Previous"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              {currentSlide < totalSlides - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-all"
                  aria-label="Next"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </>
          )}

          {totalSlides > 1 && (
            <div className="text-center mt-6 text-gray-600 text-sm">
              {currentSlide + 1} / {totalSlides}
            </div>
          )}
        </div>

        {/* Newsletter Section */}
        <div id="newsletter" className="mt-20 bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-12 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2">{t.newsletter.title}</h2>
            <p className="text-green-100 mb-8">{t.newsletter.description}</p>
            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder={t.newsletter.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  color: '#111827',
                  outline: 'none',
                  width: '300px',
                  maxWidth: '100%'
                }}
                required
              />
              <button
                type="submit"
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#ffffff',
                  color: '#2d5016',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                {t.newsletter.button}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
