'use client';

import { useState } from 'react';
import Link from 'next/link';

type Language = 'en' | 'af' | 'xh';

export default function HeritagePage() {
  const [language, setLanguage] = useState<Language>('en');

  const navLinkStyle = {
    textDecoration: 'none', color: '#4b5563', fontSize: '16px',
    fontWeight: '500', paddingBottom: '4px', borderBottom: '2px solid transparent', transition: 'all 0.3s ease'
  };

  const activeNavLinkStyle = {
    ...navLinkStyle, color: '#2d5016', fontWeight: '600', borderBottom: '2px solid #2d5016',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.target as HTMLElement).style.color = '#2d5016';
    (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.target as HTMLElement).style.color = '#4b5563';
    (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
  };

  return (
    <div className="min-h-screen bg-white">
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: 'white', boxShadow: 'none', transition: 'box-shadow 0.3s ease' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>

              <Link href="/" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Home'}{language === 'af' && 'Tuis'}{language === 'xh' && 'Ikhaya'}
              </Link>
              <Link href="/about" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'About'}{language === 'af' && 'Oor'}{language === 'xh' && 'Malunga'}
              </Link>
              <Link href="/events" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Events'}{language === 'af' && 'Geleenthede'}{language === 'xh' && 'Iziganeko'}
              </Link>
              <Link href="/store" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && "e'Bosch Store"}{language === 'af' && "e'Bosch Winkel"}{language === 'xh' && "e'Bosch Inkolo"}
              </Link>
              <Link href="/membership" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Membership'}{language === 'af' && 'Lidmaatskap'}{language === 'xh' && 'Ubulungu'}
              </Link>
              <Link href="/publicity" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Publicity'}{language === 'af' && 'Publisiteit'}{language === 'xh' && 'Isaziso'}
              </Link>
              <Link href="/partners" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Our Partners'}{language === 'af' && 'Ons Vennote'}{language === 'xh' && 'Abalingani Bethu'}
              </Link>
              <Link href="/kids-program" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'School Holiday Program'}{language === 'af' && 'Skoolvakansie Program'}{language === 'xh' && 'Inkqubo Yezikolo'}
              </Link>
              <Link href="/heritage" style={activeNavLinkStyle}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}>
                {language === 'en' && 'Heritage Program'}{language === 'af' && 'Erfenis Program'}{language === 'xh' && 'Ilifa leNkcubeko'}
              </Link>
              <Link href="/archive" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Archive'}{language === 'af' && 'Argief'}{language === 'xh' && 'Ugcino'}
              </Link>
              <Link href="/gallery" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Gallery'}{language === 'af' && 'Galery'}{language === 'xh' && 'Igalari'}
              </Link>
              <Link href="/contact" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Contact'}{language === 'af' && 'Kontak'}{language === 'xh' && 'Xhomekela'}
              </Link>

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

      <main style={{ paddingTop: '100px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#6b7280', fontWeight: 'normal' }}>
            {language === 'en' && 'Coming Soon'}
            {language === 'af' && 'Binnekort Beskikbaar'}
            {language === 'xh' && 'Kuyeza Kamsinya'}
          </p>
        </div>
      </main>
    </div>
  );
}
