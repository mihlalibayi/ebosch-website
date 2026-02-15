'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Language = 'en' | 'af' | 'xh';

interface EventFolder {
  id: string;
  titleEn: string;
  titleAf: string;
  titleXh: string;
  descriptionEn: string;
  descriptionAf: string;
  descriptionXh: string;
  images: string[];
}

const EVENT_FOLDERS: EventFolder[] = [
  {
    id: 'school-choir',
    titleEn: 'Annual School Choir',
    titleAf: 'Jaarlikse Skoollied Koor',
    titleXh: 'Umkosi Wonyaka Wabafundi Abahlabeleli',
    descriptionEn: 'Celebrate the voices of our youth.',
    descriptionAf: 'Vier die stemme van ons jeug.',
    descriptionXh: 'Siyibhalisele amazwi ethu abatsha.',
    images: [
      '/events/image1.jpg',
      '/events/image2.jpg',
      '/events/image3.jpg',
      '/events/image4.jpg',
      '/events/image5.jpg',
      '/events/image6.jpg',
      '/events/image7.jpg',
      '/events/image8.jpg',
      '/events/image9.jpg',
      '/events/image11.jpg',
      '/events/image12.jpg',
      '/events/image13.jpg',
    ],
  },
  {
    id: 'festival-lights',
    titleEn: 'Annual Festival of Lights',
    titleAf: 'Jaarlikse Lig Fees',
    titleXh: 'Umkosi Wonyaka Wezibane',
    descriptionEn: 'A magical celebration of light.',
    descriptionAf: 'Towerkrag viering van lig.',
    descriptionXh: 'Umkosi omangalisayo wezibane.',
    images: [
      '/events/image15.jpg',
      '/events/image16.jpg',
      '/events/image17.jpg',
      '/events/image18.jpg',
      '/events/image19.jpg',
      '/events/image20.jpg',
      '/events/image21.jpg',
      '/events/image22.jpg',
      '/events/image23.jpg',
      '/events/image24.jpg',
      '/events/image25.jpg',
      '/events/image26.jpg',
    ],
  },
];

export default function EventsPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [selectedImageIndexes, setSelectedImageIndexes] = useState<{ [key: string]: number }>({
    'school-choir': 0,
    'festival-lights': 0,
  });
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 15));

  const getTitle = (folder: EventFolder) => {
    if (language === 'en') return folder.titleEn;
    if (language === 'af') return folder.titleAf;
    return folder.titleXh;
  };

  const getDescription = (folder: EventFolder) => {
    if (language === 'en') return folder.descriptionEn;
    if (language === 'af') return folder.descriptionAf;
    return folder.descriptionXh;
  };

  const translations = {
    en: {
      home: 'Home',
      about: 'About',
      events: 'Events',
      contact: 'Contact',
      pageTitle: 'Annual Events',
      pageSubtitle: 'Explore our signature celebrations throughout the year',
      calendarTitle: 'Event Calendar',
      noEventsMessage: 'Check back soon for event dates',
    },
    af: {
      home: 'Tuis',
      about: 'Oor Ons',
      events: 'Geleenthede',
      contact: 'Kontak',
      pageTitle: 'Jaarlikse Gebeure',
      pageSubtitle: 'Verken ons handtekening seisoenevierings deur die jaar',
      calendarTitle: 'Gebeure Kalender',
      noEventsMessage: 'Kyk gou terug vir gebeure datums',
    },
    xh: {
      home: 'Ikhaya',
      about: 'Malunga',
      events: 'Iziganeko',
      contact: 'Unxibelelwano',
      pageTitle: 'Imigubungulo Yonyaka',
      pageSubtitle: 'Jongana iziqwekelelo zethu imigubungulo kule nyaka',
      calendarTitle: 'Ikhalerindar Yemigubungulo',
      noEventsMessage: 'Buye kamuva ukuze ukwazi imihlaka yemigubungulo',
    },
  };

  const t = translations[language];

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  };

  const monthName = selectedDate.toLocaleString(language === 'en' ? 'en-US' : language === 'af' ? 'af-ZA' : 'xh-ZA', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const getTodayDateString = () => {
    const today = new Date();
    return today.toDateString();
  };

  const selectImage = (folderId: string, index: number) => {
    setSelectedImageIndexes(prev => ({
      ...prev,
      [folderId]: index
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-end items-center">
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                {t.home}
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                {t.about}
              </Link>
              <Link href="/events" className="font-bold transition-colors" style={{ color: '#2d5016' }}>
                {t.events}
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                {t.contact}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="mb-24">
          <h1 className="text-5xl font-bold mb-3" style={{ color: '#2d5016', fontFamily: 'Georgia, serif' }}>
            {t.pageTitle}
          </h1>
          <p className="text-xl text-gray-600">{t.pageSubtitle}</p>
        </div>

        {/* Event Gallery - CENTERED CONTAINER */}
        <div className="flex justify-center mb-32" style={{ marginTop: '60px' }}>
          <div className="flex gap-32">
            {EVENT_FOLDERS.map((folder) => {
              const currentImageIndex = selectedImageIndexes[folder.id] || 0;
              const currentImage = folder.images[currentImageIndex];

              return (
                <div key={folder.id}>
                  {/* Event Title and Description */}
                  <div className="mb-6 max-w-xs">
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#2d5016' }}>
                      {getTitle(folder)}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {getDescription(folder)}
                    </p>
                  </div>

                  {/* Image LEFT + Double Thumbnails RIGHT */}
                  <div className="flex gap-6">
                    {/* MAIN IMAGE - LEFT - LARGE */}
                    <div className="flex-shrink-0">
                      <img
                        src={currentImage}
                        alt={`${getTitle(folder)} - Image ${currentImageIndex + 1}`}
                        className="rounded-lg shadow-lg"
                        style={{ width: '380px', height: '380px', objectFit: 'contain', backgroundColor: '#ffffff' }}
                      />
                    </div>

                    {/* DOUBLE COLUMN THUMBNAILS - RIGHT */}
                    <div className="flex-shrink-0">
                      <div className="grid grid-cols-2 gap-2">
                        {folder.images.map((image, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectImage(folder.id, idx)}
                            className={`rounded-lg overflow-hidden transition-all cursor-pointer ${
                              idx === currentImageIndex
                                ? 'ring-3 ring-green-600 shadow-lg'
                                : 'hover:shadow-md opacity-70 hover:opacity-100'
                            }`}
                            style={{
                              width: '60px',
                              height: '60px',
                            }}
                          >
                            <img
                              src={image}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition"
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-2 text-center">
                        {currentImageIndex + 1} / {folder.images.length}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar Section - WITH LARGE SPACE BEFORE */}
        <div className="mt-40 pt-20 border-t-2 border-gray-300">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#2d5016', fontFamily: 'Georgia, serif' }}>
            {t.calendarTitle}
          </h2>

          <div className="bg-white rounded-xl shadow-lg p-8" style={{ margin: '0 auto', maxWidth: '600px' }}>
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft size={28} style={{ color: '#2d5016' }} />
              </button>
              <h3 className="text-2xl font-bold" style={{ color: '#2d5016' }}>
                {monthName}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight size={28} style={{ color: '#2d5016' }} />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-bold text-gray-700 py-3 text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar().map((week, weekIndex) => (
                week.map((day, dayIndex) => {
                  const isToday = day && day.toDateString() === getTodayDateString();

                  return (
                    <button
                      key={`${weekIndex}-${dayIndex}`}
                      onClick={() => day && setSelectedDate(day)}
                      className={`aspect-square rounded-lg font-semibold transition text-sm ${
                        isToday
                          ? 'text-gray-900 hover:opacity-90'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                      style={isToday ? { backgroundColor: '#a1f5d8' } : {}}
                    >
                      {day ? day.getDate() : ''}
                    </button>
                  );
                })
              ))}
            </div>

            {/* Info Text */}
            <p className="text-center text-gray-500 text-sm mt-6">{t.noEventsMessage}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
