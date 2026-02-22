'use client';

import { useState } from 'react';
import Link from 'next/link';

type Language = 'en' | 'af' | 'xh';

export default function KidsProgramPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

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
        backgroundColor: 'white', borderBottom: '1px solid #f3f4f6',
        boxShadow: 'none', transition: 'box-shadow 0.3s ease'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginLeft: '16px' }}>
              <img src="/logo.jpg" alt="e'Bosch Logo" style={{ height: '52px', width: 'auto', objectFit: 'contain' }} />
            </Link>

            {openMenu && <div className="nav-overlay" onClick={() => setOpenMenu(null)} />}

            <nav className="nav-wrap" style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'relative', zIndex: 201 }}>

              <Link href="/" className="nav-home">
                {language === 'en' ? 'Home' : language === 'af' ? 'Tuis' : 'Ikhaya'}
              </Link>

              <div className="nav-divider" />

              {/* About */}
              <div className="nav-group">
                <button className={`nav-group-btn${openMenu === 'about' ? ' active' : ''}`}
                  onClick={() => setOpenMenu(openMenu === 'about' ? null : 'about')}>
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

              {/* What We Do - active on this page */}
              <div className="nav-group">
                <button className="nav-group-btn active"
                  onClick={() => setOpenMenu(openMenu === 'do' ? null : 'do')}>
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
                  onClick={() => setOpenMenu(openMenu === 'involved' ? null : 'involved')}>
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
                  onClick={() => setOpenMenu(openMenu === 'media' ? null : 'media')}>
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

      <main style={{ paddingTop: '100px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#6b7280', fontWeight: 'normal' }}>
            {language === 'en' ? 'Coming Soon' : language === 'af' ? 'Binnekort Beskikbaar' : 'Kuyeza Kamsinya'}
          </p>
        </div>
      </main>
    </div>
  );
}