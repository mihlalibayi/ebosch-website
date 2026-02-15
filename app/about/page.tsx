'use client';

import { useState } from 'react';
import Link from 'next/link';
import translations from '@/app/translations.json';

type Language = 'en' | 'af' | 'xh';

const directors = [
  {
    id: 'sias',
    name: 'Dr. Sias Mostert',
    role: 'Director',
    roleAf: 'Direkteur',
    roleXh: 'Umongameli',
    image: '/about/siasdirector.jpg'
  },
  {
    id: 'matilda',
    name: 'Prof. Matilda Burden',
    role: 'Chairperson',
    roleAf: 'Voorsitter',
    roleXh: 'Ummeli',
    image: '/about/matildachairperson.jpg'
  },
  {
    id: 'johann',
    name: 'Johann Murray',
    role: 'Director',
    roleAf: 'Direkteur',
    roleXh: 'Umongameli',
    image: '/about/johanndirector.jpg'
  },
  {
    id: 'paul',
    name: 'Paul Roviss Khambule',
    role: 'Director',
    roleAf: 'Direkteur',
    roleXh: 'Umongameli',
    image: '/about/pauldirector.jpg'
  }
];

export default function About() {
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];

  const getDirectorRole = (director: typeof directors[0]) => {
    if (language === 'af') return director.roleAf;
    if (language === 'xh') return director.roleXh;
    return director.role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <nav className="flex gap-6">
              <Link href="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                {language === 'en' && 'Home'}
                {language === 'af' && 'Tuis'}
                {language === 'xh' && 'Ikhaya'}
              </Link>
              <Link href="/about" className="text-green-600 font-medium border-b-2 border-green-600">
                {language === 'en' && 'About'}
                {language === 'af' && 'Oor Ons'}
                {language === 'xh' && 'Malunga Nathi'}
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                {language === 'en' && 'Contact'}
                {language === 'af' && 'Kontak'}
                {language === 'xh' && 'Xhomekela'}
              </Link>
            </nav>

            <div className="flex gap-2">
              {(['en', 'af', 'xh'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                    language === lang
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Content Section */}
        <section className="mb-32">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
            {t.about.sections.map((section, idx) => (
              <div key={idx} className="text-center">
                {section.content.map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-gray-700 mb-4 leading-relaxed text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Board of Directors */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-20 text-center">
            {language === 'en' && 'Board of Directors'}
            {language === 'af' && 'Raad van Direkteure'}
            {language === 'xh' && 'Ibhodi Yabaphathi'}
          </h2>

          {/* First Row - Sias and Matilda */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '120px', marginBottom: '80px' }}>
            {directors.slice(0, 2).map((director) => (
              <div key={director.id} style={{ textAlign: 'center' }}>
                <img
                  src={director.image}
                  alt={director.name}
                  style={{
                    width: '320px',
                    height: '320px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    display: 'block',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                  {director.name}
                </h3>
                <p style={{ color: '#16a34a', fontWeight: '500', fontSize: '18px' }}>
                  {getDirectorRole(director)}
                </p>
              </div>
            ))}
          </div>

          {/* Second Row - Johann and Paul */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '120px' }}>
            {directors.slice(2, 4).map((director) => (
              <div key={director.id} style={{ textAlign: 'center' }}>
                <img
                  src={director.image}
                  alt={director.name}
                  style={{
                    width: '320px',
                    height: '320px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    display: 'block',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                  {director.name}
                </h3>
                <p style={{ color: '#16a34a', fontWeight: '500', fontSize: '18px' }}>
                  {getDirectorRole(director)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm"></p>
        </div>
      </footer>
    </div>
  );
}
