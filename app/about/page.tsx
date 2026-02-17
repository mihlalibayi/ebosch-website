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
          {/* Top Navigation */}
          <div className="flex items-center justify-end mb-6">
            <nav className="flex gap-6 items-center">
              <Link href="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                {language === 'en' && 'Home'}
                {language === 'af' && 'Tuis'}
                {language === 'xh' && 'Ikhaya'}
              </Link>
              <Link href="/about" className="text-green-600 font-medium">
                {language === 'en' && 'About'}
                {language === 'af' && 'Oor Ons'}
                {language === 'xh' && 'Malunga Nathi'}
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                {language === 'en' && 'Events'}
                {language === 'af' && 'Geleenthede'}
                {language === 'xh' && 'Iziganeko'}
              </Link>
              <Link href="/store" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                {language === 'en' && "e'Bosch Store"}
                {language === 'af' && "e'Bosch Winkel"}
                {language === 'xh' && "e'Bosch Inkolo"}
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                {language === 'en' && 'Contact'}
                {language === 'af' && 'Kontak'}
                {language === 'xh' && 'Xhomekela'}
              </Link>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
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
        {/* About Content Section */}
        <section style={{ marginBottom: '80px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)',
            borderLeft: '4px solid #2d5016',
            borderRadius: '8px',
            padding: '40px',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {t.about.sections.map((section, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                {section.content.map((paragraph, pIdx) => (
                  <p key={pIdx} style={{
                    color: '#374151',
                    marginBottom: '20px',
                    lineHeight: '1.8',
                    fontSize: '17px',
                    fontWeight: pIdx === 0 ? '600' : '400'
                  }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Board of Directors */}
        <section style={{ marginBottom: '80px' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '60px',
            textAlign: 'center'
          }}>
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
                <p style={{ color: '#2d5016', fontWeight: '600', fontSize: '16px' }}>
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
                <p style={{ color: '#2d5016', fontWeight: '600', fontSize: '16px' }}>
                  {getDirectorRole(director)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Declaration of Intent Section */}
        <section style={{ textAlign: 'center' }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '400',
            color: '#374151',
            marginBottom: '40px',
            textAlign: 'center'
          }}>
            {language === 'en' && 'Declaration of Intent'}
            {language === 'af' && 'Verklaring van Voorneme'}
            {language === 'xh' && 'Isibhaso Sesiphumo'}
          </h3>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src="/about/declofint.jpg"
              alt="Declaration of Intent"
              style={{
                maxWidth: '900px',
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
