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

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentSlide, setCurrentSlide] = useState(0);
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
  const itemsPerPage = isMobile ? 1 : 3;
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}>
            {/* Navigation links - minimalist underline style */}
            <nav style={{
              display: 'flex',
              gap: '40px',
              alignItems: 'center'
            }}>
              <Link href="/" style={{
                textDecoration: 'none',
                color: '#2d5016',
                fontSize: '14px',
                fontWeight: '600',
                paddingBottom: '4px',
                borderBottom: '2px solid #2d5016',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.opacity = '0.7';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.opacity = '1';
              }}>
                {language === 'en' && 'Home'}
                {language === 'af' && 'Tuis'}
                {language === 'xh' && 'Ikhaya'}
              </Link>

              <Link href="/about" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
                fontWeight: '500',
                paddingBottom: '4px',
                borderBottom: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#2d5016';
                (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'About'}
                {language === 'af' && 'Oor'}
                {language === 'xh' && 'Malunga'}
              </Link>

              <Link href="/events" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
                fontWeight: '500',
                paddingBottom: '4px',
                borderBottom: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#2d5016';
                (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Events'}
                {language === 'af' && 'Geleenthede'}
                {language === 'xh' && 'Iziganeko'}
              </Link>

              <Link href="/store" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
                fontWeight: '500',
                paddingBottom: '4px',
                borderBottom: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#2d5016';
                (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Store'}
                {language === 'af' && 'Winkel'}
                {language === 'xh' && 'Inkolo'}
              </Link>

              <Link href="/membership" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
                fontWeight: '500',
                paddingBottom: '4px',
                borderBottom: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#2d5016';
                (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Membership'}
                {language === 'af' && 'Lidmaatskap'}
                {language === 'xh' && 'Ubulungu'}
              </Link>

              <Link href="/contact" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
                fontWeight: '500',
                paddingBottom: '4px',
                borderBottom: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = '#2d5016';
                (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Contact'}
                {language === 'af' && 'Kontak'}
                {language === 'xh' && 'Xhomekela'}
              </Link>

              {/* Language selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                style={{
                  padding: '8px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: 'white',
                  fontWeight: '500',
                  color: '#111827',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#2d5016';
                  (e.target as HTMLElement).style.boxShadow = '0 0 0 2px rgba(45, 80, 22, 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#d1d5db';
                  (e.target as HTMLElement).style.boxShadow = 'none';
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Welcome Section */}
        <div className="text-center mb-20" style={{ marginTop: '60px' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '16px',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-1px'
          }}>
            {t.welcome}
          </h1>
        </div>

        {/* Categories Carousel */}
        <div className="relative mb-12" style={{ marginTop: '80px', paddingLeft: '40px', paddingRight: '40px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '28px',
            marginBottom: '40px'
          }}>
            {visibleCategories.map((category) => (
              <Link key={category.id} href={category.href}>
                <div
                  style={{
                    position: 'relative',
                    height: '350px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: '#f5f5f5'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-8px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Image Container */}
                  <div style={{
                    position: 'absolute',
                    inset: '0',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={category.image}
                      alt={getCategoryName(category)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLImageElement).style.transform = 'scale(1.08)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLImageElement).style.transform = 'scale(1)';
                      }}
                    />
                  </div>

                  {/* Overlay Gradient */}
                  <div style={{
                    position: 'absolute',
                    inset: '0',
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
                    transition: 'all 0.4s ease'
                  }} />

                  {/* Content */}
                  <div style={{
                    position: 'absolute',
                    inset: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '32px',
                    color: 'white',
                    zIndex: 10
                  }}>
                    <h2 style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      marginBottom: '12px',
                      lineHeight: '1.3'
                    }}>
                      {getCategoryName(category)}
                    </h2>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#e0e0e0'
                    }}>
                      {t.exploreNow} →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalSlides > 1 && (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '40px',
                marginTop: '40px'
              }}>
                {/* Previous Button - Show only if not on first slide */}
                {currentSlide > 0 && (
                  <button
                    onClick={handlePrevious}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      backgroundColor: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      color: '#000000',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    aria-label="Previous"
                  >
                    <ChevronLeft size={20} />
                    <span>{t.previous}</span>
                  </button>
                )}

                {/* Dots in the center */}
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  {Array.from({ length: totalSlides }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      style={{
                        width: idx === currentSlide ? '32px' : '12px',
                        height: '12px',
                        backgroundColor: idx === currentSlide ? '#2d5016' : '#d0d0d0',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Next Button - Show only if not on last slide */}
                {currentSlide < totalSlides - 1 && (
                  <button
                    onClick={handleNext}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      backgroundColor: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      color: '#000000',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    aria-label="Next"
                  >
                    <span>{t.next}</span>
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
