'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      home: 'Home',
      about: 'About',
      events: 'Events',
      contact: 'Contact',
      title: 'Welcome to e\'Bosch',
      subtitle: 'Building Community. Preserving Heritage. Developing Leadership.',
      tagline1Title: 'Community',
      tagline1Desc: 'Building stronger connections and unity',
      tagline2Title: 'Heritage',
      tagline2Desc: 'Preserving our rich cultural legacy',
      tagline3Title: 'Leadership',
      tagline3Desc: 'Developing tomorrow\'s leaders today',
      newsletter: 'Subscribe to our Newsletter',
      subscribePlaceholder: 'Enter your email',
      subscribe: 'Subscribe',
    },
    af: {
      home: 'Tuisblad',
      about: 'Oor ons',
      events: 'Gebeure',
      contact: 'Kontak',
      title: 'Welkom by e\'Bosch',
      subtitle: 'Gemeenskap Bou. Erfenis Bewaar. Leierskap Ontwikkel.',
      tagline1Title: 'Gemeenskap',
      tagline1Desc: 'Sterker verbintenisse en eenheid bou',
      tagline2Title: 'Erfenis',
      tagline2Desc: 'Ons ryk kulturele erfenis bewaar',
      tagline3Title: 'Leierskap',
      tagline3Desc: 'Vandag die leiers van môre ontwikkel',
      newsletter: 'Teken in vir ons Nuusbrief',
      subscribePlaceholder: 'Voer jou e-pos in',
      subscribe: 'Teken in',
    },
    xh: {
      home: 'Ikhaya',
      about: 'Malunga',
      events: 'Imigubungulo',
      contact: 'Unxibelelwano',
      title: 'Wamkelekile kwe-e\'Bosch',
      subtitle: 'Ukwakha Luntu. Ukugcinela Indalo. Ukuthuthukisa Ubukumkani.',
      tagline1Title: 'Umuntu-Umuntu',
      tagline1Desc: 'Ukwakha izixhobo kunye nokuvumelana',
      tagline2Title: 'Indalo',
      tagline2Desc: 'Ukugcinela inkcubeko yethu enimanzi',
      tagline3Title: 'Ubukumkani',
      tagline3Desc: 'Uthuthukisa iinkosi zakusasa namhlanje',
      newsletter: 'Zuza Izindaba Zethu',
      subscribePlaceholder: 'Faka i-imeyili yakho',
      subscribe: 'Zuza',
    },
  };

  const t = translations[language as keyof typeof translations];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div></div>
            <nav className="flex items-center gap-8">
              <Link href="/" className="font-bold" style={{ color: '#2d5016' }}>
                {t.home}
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium">
                {t.about}
              </Link>
              <Link href="/events" className="text-gray-600 hover:text-gray-900 font-medium">
                {t.events}
              </Link>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Page Header */}
        <div className="mb-20">
          <h1 className="text-5xl font-bold mb-3" style={{ color: '#2d5016', fontFamily: 'Georgia, serif' }}>
            {t.title}
          </h1>
          <p className="text-xl text-gray-600">{t.subtitle}</p>
        </div>

        {/* Tagline Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 bg-white rounded-lg border-l-4" style={{ borderColor: '#2d5016' }}>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#2d5016' }}>
              {t.tagline1Title}
            </h3>
            <p className="text-gray-600">{t.tagline1Desc}</p>
          </div>
          <div className="p-8 bg-white rounded-lg border-l-4" style={{ borderColor: '#2d5016' }}>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#2d5016' }}>
              {t.tagline2Title}
            </h3>
            <p className="text-gray-600">{t.tagline2Desc}</p>
          </div>
          <div className="p-8 bg-white rounded-lg border-l-4" style={{ borderColor: '#2d5016' }}>
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#2d5016' }}>
              {t.tagline3Title}
            </h3>
            <p className="text-gray-600">{t.tagline3Desc}</p>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-white rounded-lg shadow-lg p-12 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#2d5016' }}>
            {t.newsletter}
          </h2>
          <form className="flex gap-3">
            <input
              type="email"
              placeholder={t.subscribePlaceholder}
              className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <button
              type="submit"
              className="px-8 py-3 rounded-lg font-semibold text-white transition"
              style={{ backgroundColor: '#2d5016' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a3009')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d5016')}
            >
              {t.subscribe}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">e'Bosch</h4>
              <p className="text-sm text-gray-400">Building community, preserving heritage, developing leadership.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t.events}</h4>
              <ul className="text-sm space-y-2 text-gray-400">
                <li><a href="/events" className="hover:text-white transition">Annual Events</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">{t.contact}</h4>
              <p className="text-sm text-gray-400">Email: info@ebosch.org</p>
              <p className="text-sm text-gray-400">Phone: +27 (0) XX XXX XXXX</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-sm text-center text-gray-400">
            <p>&copy; 2026 e'Bosch Community. Registration 150-564. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
