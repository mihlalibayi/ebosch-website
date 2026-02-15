'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '@/lib/firebase-config';
import { collection, getDocs } from 'firebase/firestore';

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

interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  event: string;
  venue: string;
  contact: string;
  ticketLink: string;
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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState<CalendarEvent | null>(null);

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
      calendarTitle: 'Event Calendar',
      noEventsMessage: 'Click on a date with events to see details',
      time: 'Time',
      venue: 'Venue',
      contact: 'Contact',
      buyTickets: 'Buy Tickets',
    },
    af: {
      home: 'Tuis',
      about: 'Oor Ons',
      events: 'Geleenthede',
      contact: 'Kontak',
      calendarTitle: 'Gebeure Kalender',
      noEventsMessage: 'Klik op \'n datum met geleenthede vir besonderhede',
      time: 'Tyd',
      venue: 'Plek',
      contact: 'Kontak',
      buyTickets: 'Koop Kaartjies',
    },
    xh: {
      home: 'Ikhaya',
      about: 'Malunga',
      events: 'Iziganeko',
      contact: 'Unxibelelwano',
      calendarTitle: 'Ikhalerindar Yemigubungulo',
      noEventsMessage: 'Cofa umhla one events ukuze ubone iinkcukacha',
      time: 'Ixesha',
      venue: 'Indawo',
      contact: 'Unxibelelwano',
      buyTickets: 'Thenga Itikhiti',
    },
  };

  const t = translations[language];

  // Load events from Firebase
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'events'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as CalendarEvent));
        data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    loadEvents();
  }, []);

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const getEventCountText = (count: number): string => {
    const nums: { [key: number]: string } = {
      1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
      6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
    };
    return nums[count] || count.toString();
  };

  const getEventsForDate = (date: Date | null): CalendarEvent[] => {
    if (!date) return [];
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const handleDayClick = (day: Date) => {
    const dayEvents = getEventsForDate(day);
    if (dayEvents.length > 0) {
      setModalEvent(dayEvents[0]);
      setModalOpen(true);
    }
  };

  const monthName = selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-end gap-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">{t.home}</Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900">{t.about}</Link>
          <Link href="/events" style={{ color: '#2d5016' }} className="font-bold">{t.events}</Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900">{t.contact}</Link>
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="border rounded px-2">
            <option value="en">EN</option>
            <option value="af">AF</option>
            <option value="xh">XH</option>
          </select>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Gallery */}
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
                            onClick={() => setSelectedImageIndexes({...selectedImageIndexes, [folder.id]: idx})}
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

        {/* Calendar */}
        <div className="mt-40 pt-20 border-t-2 border-gray-300">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#2d5016' }}>{t.calendarTitle}</h2>
          <div className="bg-white rounded-xl shadow-lg p-8 mx-auto" style={{ maxWidth: '800px' }}>
            {/* Month Nav */}
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded">←</button>
              <h3 className="text-2xl font-bold" style={{ color: '#2d5016' }}>{monthName}</h3>
              <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded">→</button>
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center font-bold text-gray-700 py-3">{d}</div>)}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar().map((week, wi) => week.map((day, di) => {
                const dayEvents = getEventsForDate(day);
                const isToday = day?.toDateString() === new Date().toDateString();
                return (
                  <button key={`${wi}-${di}`} onClick={() => day && handleDayClick(day)} 
                    className="aspect-square rounded-lg font-semibold transition flex flex-col items-center justify-center"
                    style={{ backgroundColor: isToday ? '#9ca3af' : '#f9fafb', color: isToday ? '#1f2937' : '#4b5563' }}>
                    <span>{day?.getDate() || ''}</span>
                    {dayEvents.length > 0 && <span className="text-xs font-bold" style={{ color: '#2d5016' }}>{getEventCountText(dayEvents.length)} event{dayEvents.length > 1 ? 's' : ''}</span>}
                  </button>
                );
              }))}
            </div>
            <p className="text-center text-gray-500 text-sm mt-6">{t.noEventsMessage}</p>
          </div>
        </div>
      </main>

      {/* MODAL - Simple and Direct */}
      {modalOpen && modalEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#2d5016' }}>{modalEvent.event}</h3>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>{t.time}</p>
              <p style={{ color: '#1f2937' }}>{modalEvent.time}</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>{t.venue}</p>
              <p style={{ color: '#1f2937' }}>{modalEvent.venue}</p>
            </div>
            {modalEvent.contact && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>{t.contact}</p>
                <p style={{ color: '#1f2937' }}>{modalEvent.contact}</p>
              </div>
            )}
            {modalEvent.ticketLink && (
              <a href={modalEvent.ticketLink} target="_blank" rel="noopener noreferrer" 
                style={{ display: 'block', width: '100%', padding: '10px', backgroundColor: '#2d5016', color: 'white', textAlign: 'center', borderRadius: '6px', marginBottom: '8px', textDecoration: 'none' }}>
                {t.buyTickets}
              </a>
            )}
            <button onClick={() => setModalOpen(false)} 
              style={{ width: '100%', padding: '10px', backgroundColor: '#e5e7eb', color: '#1f2937', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
