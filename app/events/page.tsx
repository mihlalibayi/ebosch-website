'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type Language = 'en' | 'af' | 'xh';

interface EventFolder {
  id: string;
  titleEn: string;
  titleAf: string;
  titleXh: string;
  descriptionEn: string;
  descriptionAf: string;
  descriptionXh: string;
  coverImage: string;
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
    coverImage: '/events/image1.jpg',
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
      '/events/image10.jpg',
      '/events/image11.jpg',
      '/events/image12.jpg',
      '/events/image13.jpg',
      '/events/image14.jpg',
    ],
  },
  {
    id: 'festival-lights',
    titleEn: 'Annual Festival of Lights',
    titleAf: 'Jaarlikse Lig Fees',
    titleXh: 'Umkosi Wonyaka Wezibane',
    descriptionEn: 'A magical celebration of light and community.',
    descriptionAf: 'Towerkrag viering van lig en gemeenskap.',
    descriptionXh: 'Umkosi omangalisayo wezibane kunye noluntu.',
    coverImage: '/events/image15.jpg',
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
  const [showGallery, setShowGallery] = useState(false);
  const [galleryFolder, setGalleryFolder] = useState<EventFolder | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

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
      closeGallery: 'Close',
      next: 'Next',
      prev: 'Previous',
      viewGallery: 'View Gallery',
      of: 'of',
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
      closeGallery: 'Sluit',
      next: 'Volgende',
      prev: 'Vorige',
      viewGallery: 'Sien Galerij',
      of: 'van',
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
      closeGallery: 'Vala',
      next: 'Okulandelayo',
      prev: 'Okwangaphambili',
      viewGallery: 'Jonga Igaleri',
      of: 'ye',
    },
  };

  const t = translations[language];

  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 15));

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

  const openGallery = (folder: EventFolder) => {
    setGalleryFolder(folder);
    setImageIndex(0);
    setShowGallery(true);
  };

  const closeGalleryModal = () => {
    setShowGallery(false);
    setGalleryFolder(null);
  };

  const nextImage = () => {
    if (galleryFolder) {
      setImageIndex((prev) => (prev === galleryFolder.images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = () => {
    if (galleryFolder) {
      setImageIndex((prev) => (prev === 0 ? galleryFolder.images.length - 1 : prev - 1));
    }
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
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-3" style={{ color: '#2d5016', fontFamily: 'Georgia, serif' }}>
            {t.pageTitle}
          </h1>
          <p className="text-xl text-gray-600">{t.pageSubtitle}</p>
        </div>

        {/* Event Folders Grid - MUCH SMALLER */}
        <div className="mb-20">
          <div className="flex justify-center gap-8">
            {EVENT_FOLDERS.map((folder) => (
              <div key={folder.id} className="flex flex-col" style={{ maxWidth: '180px' }}>
                {/* Small Cover Image */}
                <div 
                  className="relative w-full rounded-lg overflow-hidden bg-gray-300 cursor-pointer group shadow-md hover:shadow-lg transition mb-2"
                  style={{ height: '120px' }}
                  onClick={() => openGallery(folder)}
                >
                  <img
                    src={folder.coverImage}
                    alt={getTitle(folder)}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition"></div>
                </div>

                {/* Content */}
                <h3 className="text-sm font-bold mb-1" style={{ color: '#2d5016' }}>
                  {getTitle(folder)}
                </h3>
                <p className="text-gray-600 mb-2 text-xs flex-grow leading-tight">
                  {getDescription(folder)}
                </p>

                {/* View Gallery Button */}
                <button
                  onClick={() => openGallery(folder)}
                  className="w-full px-2 py-1 rounded font-semibold transition text-xs"
                  style={{ backgroundColor: '#2d5016', color: 'white' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a3009')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d5016')}
                >
                  {t.viewGallery}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Section - WITH SPACE BEFORE */}
        <div className="mt-32 pt-16 border-t-2 border-gray-300">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#2d5016', fontFamily: 'Georgia, serif' }}>
            {t.calendarTitle}
          </h2>

          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
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
                  const isSelected = day && day.toDateString() === selectedDate.toDateString();
                  const isToday = day && day.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={`${weekIndex}-${dayIndex}`}
                      onClick={() => day && setSelectedDate(day)}
                      className={`aspect-square rounded-lg font-semibold transition text-sm ${
                        isSelected
                          ? 'text-white shadow-lg'
                          : isToday
                          ? 'bg-yellow-50 border-2 border-yellow-400'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                      style={isSelected ? { backgroundColor: '#2d5016' } : {}}
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

      {/* Gallery Modal */}
      {showGallery && galleryFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b" style={{ backgroundColor: '#f5f5f5' }}>
              <h2 className="text-xl font-bold" style={{ color: '#2d5016' }}>
                {getTitle(galleryFolder)}
              </h2>
              <button
                onClick={closeGalleryModal}
                className="p-1 hover:bg-gray-200 rounded-lg transition"
              >
                <X size={24} style={{ color: '#2d5016' }} />
              </button>
            </div>

            {/* Image Display */}
            <div className="relative w-full h-96 bg-gray-300 flex items-center justify-center overflow-hidden">
              <img
                src={galleryFolder.images[imageIndex]}
                alt={`Image ${imageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Navigation Buttons */}
              {galleryFolder.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-lg hover:bg-opacity-75 transition"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-lg hover:bg-opacity-75 transition"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {imageIndex + 1} {t.of} {galleryFolder.images.length}
              </div>
            </div>

            {/* Thumbnails */}
            {galleryFolder.images.length > 1 && (
              <div className="p-4 bg-gray-50 flex gap-2 overflow-x-auto">
                {galleryFolder.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      idx === imageIndex
                        ? 'border-green-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="p-4 text-center">
              <button
                onClick={closeGalleryModal}
                className="px-6 py-2 rounded-lg font-semibold transition text-sm"
                style={{ backgroundColor: '#2d5016', color: 'white' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a3009')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d5016')}
              >
                {t.closeGallery}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
