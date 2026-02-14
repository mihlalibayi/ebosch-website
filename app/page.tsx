'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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

const greens = ['#4a7c2c', '#2d5016', '#6ba539', '#3d6b1f', '#5a9e3d'];

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [wordCloudWords, setWordCloudWords] = useState<Array<{ word: string; color: string; size: number }>>([]);

  useEffect(() => {
    // Generate word cloud
    const words = translations[language].wordcloud.words;
    const cloudWords = words.map((word) => ({
      word,
      color: greens[Math.floor(Math.random() * greens.length)],
      size: Math.random() * 24 + 12 // 12px to 36px
    }));
    setWordCloudWords(cloudWords.sort(() => Math.random() - 0.5));
  }, [language]);

  const t = translations[language];
  const itemsPerPage = window.innerWidth < 768 ? 2 : 3;
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
    // Newsletter form will redirect to Brevo link
    window.location.href = 'https://c37f4fdb.sibforms.com/serve/MUIFAKK61xYDABQ-AXEDD3Gfxg60gBJDhoZRcBxVipTAoZ2nNtyBhNUXt11yOb9GptolX8z0PVUKxY7Wsj36YRHBcXelmnbMb4PC8s-xNdRmbL_OLWNjuyzj_Qub4du6_eL75IQ5rYQlJzNVi-7UgcLaSjk5QCEGMd6bKZA3sTYGxZUmInMj2rifqwz0agU5bL_NoYy5xjgjLY66';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Language Switcher */}
          <div className="flex justify-end mb-4 gap-2">
            {(['en', 'af', 'xh'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  language === lang
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Logo and Word Cloud */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/logo.jpg"
                alt="e'Bosch Logo"
                width={120}
                height={120}
                className="rounded-lg shadow-md"
              />
            </div>

            {/* Word Cloud */}
            <div className="flex-1 p-6 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-200">
              <div className="flex flex-wrap gap-4 items-center justify-center">
                {wordCloudWords.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      color: item.color,
                      fontSize: `${item.size}px`,
                      fontWeight: 'bold',
                      fontFamily: 'Georgia, serif'
                    }}
                    className="whitespace-nowrap"
                  >
                    {item.word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to e'Bosch
          </h1>
          <p className="text-gray-600">
            {language === 'en' && 'Community | Heritage | Leadership'}
            {language === 'af' && 'Gemeenskap | Erfenis | Leierskap'}
            {language === 'xh' && 'Uluntu | Inkcubeko | Ubunkokheli'}
          </p>
        </div>

        {/* Categories Carousel */}
        <div className="relative">
          <div className={`grid gap-6 ${itemsPerPage === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {visibleCategories.map((category) => (
              <Link key={category.id} href={category.href}>
                <div className="relative h-64 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105">
                  <Image
                    src={category.image}
                    alt={getCategoryName(category)}
                    fill
                    className="object-cover"
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

          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              {currentSlide > 0 && (
                <button
                  onClick={handlePrevious}
                  className="absolute -left-16 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              {currentSlide < totalSlides - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute -right-16 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </>
          )}

          {/* Slide Indicator */}
          {totalSlides > 1 && (
            <div className="text-center mt-6 text-gray-600 text-sm">
              {currentSlide + 1} / {totalSlides}
            </div>
          )}
        </div>

        {/* Newsletter Section */}
        <div className="mt-20 bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2">{t.newsletter.title}</h2>
            <p className="text-green-100 mb-6">{t.newsletter.description}</p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                placeholder={t.newsletter.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-green-600 font-bold rounded hover:bg-gray-100 transition-all"
              >
                {t.newsletter.button}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">{t.footer.npo}</p>
        </div>
      </footer>
    </div>
  );
}
