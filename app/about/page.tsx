'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Director {
  id: string;
  name: string;
  titleEn: string;
  titleAf: string;
  titleXh: string;
  bioEn: string;
  bioAf: string;
  bioXh: string;
  image: string;
}

const DIRECTORS: Director[] = [
  {
    id: 'sias-mostert',
    name: 'Dr. Sias Mostert',
    titleEn: 'Director',
    titleAf: 'Direkteur',
    titleXh: 'Umongameli',
    bioEn: 'Visionary leader with decades of experience in community development and heritage preservation.',
    bioAf: 'Visionêre leier met dekades van ondervinding in gemeenskapsontwikkeling en erfenisbehoud.',
    bioXh: 'Umongameli onobulumko onobuthongo bokhuselelo lwesilizali nokugcinela indalo.',
    image: '/about/director1.jpg',
  },
  {
    id: 'matilda-burden',
    name: 'Prof. Matilda Burden',
    titleEn: 'Co-Director',
    titleAf: 'Mede-Direkteur',
    titleXh: 'Umongameli Ofela',
    bioEn: 'Leading academic and cultural advocate dedicated to youth empowerment and leadership development.',
    bioAf: 'Leidende akademikus en kultuurvoorstander wat toegewyd is aan jongstevernuwing en leierskap.',
    bioXh: 'Umfundisi omkhulu kunye nomthameli woluntu ozingela ukuthuthukisa abatsha nobukumkani.',
    image: '/about/director2.jpg',
  },
  {
    id: 'johann-murray',
    name: 'Johann Murray',
    titleEn: 'Board Member',
    titleAf: 'Raadslid',
    titleXh: 'Ilungu leBoadi',
    bioEn: 'Strategic thinker driving operational excellence and sustainable community initiatives.',
    bioAf: 'Strategiese denker wat operasionele uitnemendheid en volhoubare gemeenskapsprojekel voordryf.',
    bioXh: 'Umceli ophakamising okuqulunquluntu kunye nenkuthazo eyomeleleyo yoluntu.',
    image: '/about/director3.jpg',
  },
  {
    id: 'paul-khambule',
    name: 'Paul Roviss Khambule',
    titleEn: 'Board Member',
    titleAf: 'Raadslid',
    titleXh: 'Ilungu leBoadi',
    bioEn: 'Community advocate passionate about bridging cultural gaps and fostering inclusive growth.',
    bioAf: 'Gemeenskapsvoorstander passievol oor kultuurklowe oorbrugga en inklusiewe groei bevorder.',
    bioXh: 'Umthameli woluntu onomdla ekufumana inkalo kunye nokuthuthukisa bonke abantu.',
    image: '/about/director4.jpg',
  },
];

export default function About() {
  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      home: 'Home',
      about: 'About',
      events: 'Events',
      contact: 'Contact',
      pageTitle: 'About e\'Bosch',
      pageSubtitle: 'Building community, preserving heritage, developing leadership',
      aboutText: 'e\'Bosch is a community-based organization dedicated to preserving cultural heritage, developing leadership skills, and fostering meaningful community engagement. Our mission is to create a thriving community where culture, education, and social development go hand in hand.',
      directors: 'Our Leadership',
      declaration: 'Declaration of Intent',
    },
    af: {
      home: 'Tuisblad',
      about: 'Oor ons',
      events: 'Gebeure',
      contact: 'Kontak',
      pageTitle: 'Oor e\'Bosch',
      pageSubtitle: 'Gemeenskap bou, erfenis bewaar, leierskap ontwikkel',
      aboutText: 'e\'Bosch is \'n gemeenskapgebaseerde organisasie toegewyd aan erfenisbehoud, leierskapontwikkeling en betekenisvolle gemeenskapsdeelname. Ons missie is \'n bleiende gemeenskap skep waar kultuur, onderwys en maatskaplike ontwikkeling hand aan hand gaan.',
      directors: 'Ons Leierskap',
      declaration: 'Verklaring van Doel',
    },
    xh: {
      home: 'Ikhaya',
      about: 'Malunga',
      events: 'Imigubungulo',
      contact: 'Unxibelelwano',
      pageTitle: 'Malunga ne-e\'Bosch',
      pageSubtitle: 'Ukwakha luntu, ukugcinela indalo, ukuthuthukisa ubukumkani',
      aboutText: 'e\'Bosch yi indawo yoluntu ezingela ukugcinela inkcubeko, uthuthukisa ubukumkani kunye nokubandakanya koluntu. Injongo yethu yi ukwakha luntu elikhulayo apho inkcubeko, ifundo kunye nothuthuko lwentlalontle zisebenza kunye.',
      directors: 'Ababoneleli Bethu',
      declaration: 'Isitatimende Senzolo',
    },
  };

  const t = translations[language as keyof typeof translations];

  const getTitle = (director: Director) => {
    if (language === 'en') return director.titleEn;
    if (language === 'af') return director.titleAf;
    return director.titleXh;
  };

  const getBio = (director: Director) => {
    if (language === 'en') return director.bioEn;
    if (language === 'af') return director.bioAf;
    return director.bioXh;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div></div>
            <nav className="flex items-center gap-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
                {t.home}
              </Link>
              <Link href="/about" className="font-bold" style={{ color: '#2d5016' }}>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-3" style={{ color: '#2d5016', fontFamily: 'Georgia, serif' }}>
            {t.pageTitle}
          </h1>
          <p className="text-xl text-gray-600">{t.pageSubtitle}</p>
        </div>

        {/* About Text */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-20 max-w-3xl">
          <p className="text-gray-700 leading-relaxed text-lg">{t.aboutText}</p>
        </div>

        {/* Directors Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: '#2d5016', fontFamily: 'Georgia, serif' }}>
            {t.directors}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {DIRECTORS.map((director) => (
              <div key={director.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <img
                  src={director.image}
                  alt={director.name}
                  className="w-full h-80 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-1" style={{ color: '#2d5016' }}>
                    {director.name}
                  </h3>
                  <p className="text-sm font-semibold text-green-700 mb-3">
                    {getTitle(director)}
                  </p>
                  <p className="text-sm text-gray-600">{getBio(director)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Declaration Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#2d5016' }}>
            {t.declaration}
          </h2>
          <img
            src="/about/declaration.jpg"
            alt="Declaration of Intent"
            className="w-full rounded-lg"
          />
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
