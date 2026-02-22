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
    name: 'Heritage Project',
    nameAf: 'Erfenisprojek',
    nameXh: 'iProjekthi yeLifa leMveli',
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
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
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

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .nav-wrap { font-family: 'DM Sans', sans-serif; }
        .nav-group { position: relative; }
        .nav-group-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 8px 14px; background: none; border: none; cursor: pointer;
          font-size: 16px; font-weight: 500; color: #4b5563;
          border-radius: 7px; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .nav-group-btn:hover { color: #2d5016; background: rgba(45,80,22,0.06); }
        .nav-group-btn.active { color: #2d5016; background: rgba(45,80,22,0.09); font-weight: 600; }
        .nav-arrow { font-size: 10px; transition: transform 0.25s; display: inline-block; color: #9ca3af; }
        .nav-group-btn.active .nav-arrow { transform: rotate(180deg); color: #2d5016; }
        .nav-dropdown {
          position: absolute; top: calc(100% + 8px); left: 50%;
          transform: translateX(-50%); background: white;
          border: 1px solid #e5e7eb; border-radius: 12px;
          box-shadow: 0 10px 36px rgba(0,0,0,0.11);
          min-width: 220px; padding: 6px; z-index: 200;
          animation: dropFade 0.15s ease;
        }
        @keyframes dropFade {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .nav-dropdown a {
          display: block; padding: 10px 16px; text-decoration: none;
          color: #374151; font-size: 16px; border-radius: 7px;
          transition: all 0.15s; font-weight: 400; font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .nav-dropdown a:hover { background: #f0fdf4; color: #2d5016; font-weight: 500; }
        .nav-home {
          text-decoration: none; color: #4b5563; font-size: 16px; font-weight: 500;
          padding: 8px 14px; border-radius: 7px; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }
        .nav-home:hover { color: #2d5016; background: rgba(45,80,22,0.06); }
        .nav-home.active { color: #2d5016; background: rgba(45,80,22,0.09); font-weight: 600; }
        .nav-standalone {
          text-decoration: none; color: #4b5563; font-size: 16px; font-weight: 500;
          padding: 8px 14px; border-radius: 7px; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }
        .nav-standalone:hover { color: #2d5016; background: rgba(45,80,22,0.06); }
        .nav-divider { width: 1px; height: 18px; background: #e5e7eb; margin: 0 4px; }
        .nav-overlay { position: fixed; inset: 0; z-index: 100; }
      `}</style>

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 150,
        backgroundColor: 'white',
        borderBottom: '1px solid #f3f4f6',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.07)' : 'none',
        transition: 'box-shadow 0.3s ease'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '14px', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginLeft: '16px' }}>
              <img src="/logo.jpg" alt="e'Bosch Logo" style={{ height: '52px', width: 'auto', objectFit: 'contain' }} />
            </Link>

            {openMenu && <div className="nav-overlay" onClick={() => { setOpenMenu(null); }} />}

            <nav className="nav-wrap" style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'relative', zIndex: 201 }}>

              <Link href="/" className={`nav-home${activeSection === 'home' ? ' active' : ''}`}
                onClick={() => { setOpenMenu(null); setActiveSection('home'); }}>
                {language === 'en' ? 'Home' : language === 'af' ? 'Tuis' : 'Ikhaya'}
              </Link>

              <div className="nav-divider" />

              {/* About */}
              <div className="nav-group">
                <button className={`nav-group-btn${openMenu === 'about' ? ' active' : ''}`}
                  onClick={() => { setActiveSection('about'); setOpenMenu(openMenu === 'about' ? null : 'about'); }}>
                  {language === 'en' ? 'About' : language === 'af' ? 'Oor' : 'Malunga'} <span className="nav-arrow">▾</span>
                </button>
                {openMenu === 'about' && (
                  <div className="nav-dropdown">
                    <Link href="/about" onClick={() => setOpenMenu(null)}>
                      {language === 'en' ? 'About' : language === 'af' ? 'Oor' : 'Malunga'}
                    </Link>
                    <Link href="/partners" onClick={() => setOpenMenu(null)}>
                      {language === 'en' ? 'Our Partners' : language === 'af' ? 'Ons Vennote' : 'Abalingani Bethu'}
                    </Link>
                  </div>
                )}
              </div>

              {/* What We Do */}
              <div className="nav-group">
                <button className={`nav-group-btn${openMenu === 'do' ? ' active' : ''}`}
                  onClick={() => { setActiveSection('do'); setOpenMenu(openMenu === 'do' ? null : 'do'); }}>
                  {language === 'en' ? 'What We Do' : language === 'af' ? 'Wat Ons Doen' : 'Esikwenzayo'} <span className="nav-arrow">▾</span>
                </button>
                {openMenu === 'do' && (
                  <div className="nav-dropdown">
                    <Link href="/events" onClick={() => setOpenMenu(null)}>
                      {language === 'en' ? 'Events' : language === 'af' ? 'Geleenthede' : 'Iziganeko'}
                    </Link>
                    <Link href="/kids-program" onClick={() => setOpenMenu(null)}>
                      {language === 'en' ? 'School Holiday Program' : language === 'af' ? 'Skoolvakansie Program' : 'Inkqubo Yezikolo'}
                    </Link>
                    <Link href="/ebosch-calendar" onClick={() => setOpenMenu(null)}>
                      {language === 'en' ? "e'Bosch Calendar" : language === 'af' ? "e'Bosch Kalender" : "Ikhalenda ye-e'Bosch"}
                    </Link>
                    <Link href="/heritage" onClick={() => setOpenMenu(null)}>
                      {language === 'en' ? 'Heritage Project' : language === 'af' ? 'Erfenisprojek' : 'iProjekthi yeLifa leMveli'}
                    </Link>
                    <Link href="/publicity" onClick={() => setOpenMenu(null)}>
                      {language === 'en' ? 'Publicity' : language === 'af' ? 'Publisiteit' : 'Isaziso'}
                    </Link>
                  </div>
                )}
              </div>

              {/* Get Involved */}
              <div className="nav-group">
                <button className={`nav-group-btn${openMenu === 'involved' ? ' active' : ''}`}
                  onClick={() => { setActiveSection('involved'); setOpenMenu(openMenu === 'involved' ? null : 'involved'); }}>
                  {language === 'en' ? 'Get Involved' : language === 'af' ? 'Raak Betrokke' : 'Zibandakanye'} <span className="nav-arrow">▾</span>
                </button>
                {openMenu === 'involved' && (
                  <div className="nav-dropdown">
                    <Link href="/membership" onClick={() => setOpenMenu(null)}>
                      {language === 'en' ? 'Membership' : language === 'af' ? 'Lidmaatskap' : 'Ubulungu'}
                    </Link>
                    <Link href="/store" onClick={() => setOpenMenu(null)}>
                      {language === 'en' ? "e'Bosch Store" : language === 'af' ? "e'Bosch Winkel" : "e'Bosch Inkolo"}
                    </Link>
                  </div>
                )}
              </div>

              {/* Media */}
              <div className="nav-group">
                <button className={`nav-group-btn${openMenu === 'media' ? ' active' : ''}`}
                  onClick={() => { setActiveSection('media'); setOpenMenu(openMenu === 'media' ? null : 'media'); }}>
                  {language === 'en' ? 'Media' : language === 'af' ? 'Media' : 'Imithombo'} <span className="nav-arrow">▾</span>
                </button>
                {openMenu === 'media' && (
                  <div className="nav-dropdown">
                    <Link href="/archive" onClick={() => setOpenMenu(null)}>
                      {language === 'en' ? 'Archive' : language === 'af' ? 'Argief' : 'Ugcino'}
                    </Link>
                    <Link href="/gallery" onClick={() => setOpenMenu(null)}>
                      {language === 'en' ? 'Gallery' : language === 'af' ? 'Galery' : 'Igalari'}
                    </Link>
                  </div>
                )}
              </div>

              <div className="nav-divider" />

              <Link href="/contact" className="nav-standalone" onClick={() => setOpenMenu(null)}>
                {language === 'en' ? 'Contact' : language === 'af' ? 'Kontak' : 'Xhomekela'}
              </Link>

              <div className="nav-divider" />

              <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}
                style={{ padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', backgroundColor: 'white', fontWeight: '500', color: '#111827', cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = '#2d5016'; (e.target as HTMLElement).style.boxShadow = '0 0 0 2px rgba(45, 80, 22, 0.1)'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = '#d1d5db'; (e.target as HTMLElement).style.boxShadow = 'none'; }}>
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="xh">Xhosa</option>
              </select>

            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" style={{ paddingTop: '100px' }}>
        <div className="text-center mb-20" style={{ marginTop: '30px' }}>
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

        <div className="relative mb-12" style={{ marginTop: '80px', paddingLeft: '40px', paddingRight: '40px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '28px',
            marginBottom: '40px'
          }}>
            {visibleCategories.map((category) => (
              <Link key={category.id} href={category.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  position: 'relative',
                  height: '350px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
                    <img
                      src={category.image}
                      alt={getCategoryName(category)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.08)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                    />
                  </div>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
                    pointerEvents: 'none'
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px',
                    color: 'white', display: 'flex', flexDirection: 'column',
                    justifyContent: 'flex-end', height: '100%'
                  }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
                      {getCategoryName(category)}
                    </h3>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#e0e0e0' }}>
                      {t.exploreNow} →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
              {currentSlide > 0 && (
                <button onClick={handlePrevious}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#ffffff', border: '2px solid #000000', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease', color: '#000000', fontWeight: '600', fontSize: '14px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.boxShadow = 'none'; }}
                  aria-label="Previous">
                  <ChevronLeft size={20} />
                  <span>{t.previous}</span>
                </button>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                {Array.from({ length: totalSlides }).map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)}
                    style={{ width: idx === currentSlide ? '32px' : '12px', height: '12px', backgroundColor: idx === currentSlide ? '#2d5016' : '#d0d0d0', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                    aria-label={`Go to slide ${idx + 1}`} />
                ))}
              </div>

              {currentSlide < totalSlides - 1 && (
                <button onClick={handleNext}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#ffffff', border: '2px solid #000000', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease', color: '#000000', fontWeight: '600', fontSize: '14px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.boxShadow = 'none'; }}
                  aria-label="Next">
                  <span>{t.next}</span>
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}