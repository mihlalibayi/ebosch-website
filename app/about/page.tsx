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

  // Xhosa about content
  const aboutContent = {
    en: [
      "e'Bosch is a future heritage project",
      "Working together so that Stellenbosch has a heritage where it is welcoming, safe, and everybody is thriving.",
      "We achieve the future heritage by getting to know each other, appreciate each other and respect each other.",
      "Finally, we weave a trust fabric in which all the problems in society can be solved at a minimum cost."
    ],
    af: [
      "e'Bosch is 'n toekomstige erfenisprojek",
      "Saamwerk sodat Stellenbosch 'n erfenis het waar dit welkom is, veilig is, en almal floreer.",
      "Ons bereik die toekomstige erfenis deur mekaar te leer ken, mekaar waardering te gee en mekaar te respekteer.",
      "Laastens weef ons 'n vertrouensfabryk waarin alle probleme in die samelewing teen minimale koste opgelos kan word."
    ],
    xh: [
      "i-e'Bosch yiprojekthi yefutyela yenkcubeko",
      "Kusebenza ngokudibanisa ukuze iStellenbosh ibe nenkcubeko apho ikhululekile, ilungile, kwaye wonke umntu ukulungele.",
      "Siyayiphumeza ifutyela yenkcubeko ngokwazi enye enye, ukuhlonipha enye enye nokukhulelwa kwenye enye.",
      "Okokugqibela, siluka ilaphu lokuthembana apho zonke iingxaki eluntwini zinokusonjululwa ngexabiso eliphantsi."
    ]
  };

  const getDirectorRole = (director: typeof directors[0]) => {
    if (language === 'af') return director.roleAf;
    if (language === 'xh') return director.roleXh;
    return director.role;
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
                color: '#4b5563',
                fontSize: '16px',
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
                (e.target as HTMLElement).style.color = '#4b5563';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Home'}
                {language === 'af' && 'Tuis'}
                {language === 'xh' && 'Ikhaya'}
              </Link>

              <Link href="/about" style={{
                textDecoration: 'none',
                color: '#2d5016',
                fontSize: '16px',
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
                {language === 'en' && 'About'}
                {language === 'af' && 'Oor'}
                {language === 'xh' && 'Malunga'}
              </Link>

              <Link href="/events" style={{
                textDecoration: 'none',
                color: '#4b5563',
                fontSize: '16px',
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
                (e.target as HTMLElement).style.color = '#4b5563';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Events'}
                {language === 'af' && 'Geleenthede'}
                {language === 'xh' && 'Iziganeko'}
              </Link>

              <Link href="/store" style={{
                textDecoration: 'none',
                color: '#4b5563',
                fontSize: '16px',
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
                (e.target as HTMLElement).style.color = '#4b5563';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && "e'Bosch Store"}
                {language === 'af' && "e'Bosch Winkel"}
                {language === 'xh' && "e'Bosch Inkolo"}
              </Link>

              <Link href="/membership" style={{
                textDecoration: 'none',
                color: '#4b5563',
                fontSize: '16px',
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
                (e.target as HTMLElement).style.color = '#4b5563';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Membership'}
                {language === 'af' && 'Lidmaatskap'}
                {language === 'xh' && 'Ubulungu'}
              </Link>

              <Link href="/contact" style={{
                textDecoration: 'none',
                color: '#4b5563',
                fontSize: '16px',
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
                (e.target as HTMLElement).style.color = '#4b5563';
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
                  fontSize: '15px',
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
            <div style={{ textAlign: 'center' }}>
              {aboutContent[language].map((paragraph, pIdx) => (
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
