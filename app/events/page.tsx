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
  contacts: Array<{name: string; email: string; phone: string}>;
  ticketLink: string;
  eventType?: string;
  eventLink?: string;
  detailsConfirmed?: boolean;
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
                color: '#888888',
                fontSize: '14px',
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
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Home'}
                {language === 'af' && 'Tuis'}
                {language === 'xh' && 'Ikhaya'}
              </Link>

              <Link href="/about" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
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
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'About'}
                {language === 'af' && 'Oor'}
                {language === 'xh' && 'Malunga'}
              </Link>

              <Link href="/events" style={{
                textDecoration: 'none',
                color: '#2d5016',
                fontSize: '14px',
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
                {language === 'en' && 'Events'}
                {language === 'af' && 'Geleenthede'}
                {language === 'xh' && 'Iziganeko'}
              </Link>

              <Link href="/store" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
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
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Store'}
                {language === 'af' && 'Winkel'}
                {language === 'xh' && 'Inkolo'}
              </Link>

              <Link href="/membership" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
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
                (e.target as HTMLElement).style.color = '#888888';
                (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
              }}>
                {language === 'en' && 'Membership'}
                {language === 'af' && 'Lidmaatskap'}
                {language === 'xh' && 'Ubulungu'}
              </Link>

              <Link href="/contact" style={{
                textDecoration: 'none',
                color: '#888888',
                fontSize: '14px',
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
                (e.target as HTMLElement).style.color = '#888888';
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
                  fontSize: '13px',
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
        <div style={{ marginTop: '80px', paddingTop: '20px' }}>
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: '#2d5016' }}>{t.calendarTitle}</h2>
          <div className="bg-white rounded-xl shadow-lg p-8 mx-auto" style={{ maxWidth: '1000px' }}>
            {/* Month Nav */}
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded">←</button>
              <h3 className="text-2xl font-bold" style={{ color: '#4b5563' }}>{monthName}</h3>
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
                const greenShades = ['#2d5016', '#16a34a', '#059669', '#10b981', '#14b8a6'];
                
                return (
                  <button key={`${wi}-${di}`} onClick={() => day && handleDayClick(day)} 
                    className="aspect-square rounded-lg font-semibold transition flex flex-col items-center justify-center relative hover:shadow-md"
                    style={{
                      backgroundColor: isToday ? '#9ca8a0' : '#f9fafb',
                      color: isToday ? 'white' : '#4b5563',
                      cursor: day ? 'pointer' : 'default',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s',
                      overflow: 'visible',
                      paddingBottom: dayEvents.length > 0 ? '18px' : '0'
                    }}>
                    <span>{day?.getDate() || ''}</span>
                    {dayEvents.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '4px'
                      }}>
                        {dayEvents.map((_, i) => (
                          <div
                            key={i}
                            style={{
                              width: '20px',
                              height: '6px',
                              backgroundColor: greenShades[i % greenShades.length],
                              borderRadius: '2px'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              }))}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL - Show All Details */}
      {modalOpen && modalEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', margin: '20px auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#2d5016' }}>{modalEvent.event}</h3>
            
            {/* Date */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Date</p>
              <p style={{ color: '#1f2937' }}>{modalEvent.date}</p>
            </div>

            {/* Time */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>{t.time}</p>
              <p style={{ color: '#1f2937' }}>{modalEvent.time}</p>
            </div>

            {/* Event Type */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Event Type</p>
              <p style={{ color: '#1f2937', textTransform: 'capitalize' }}>{modalEvent.eventType}</p>
            </div>

            {/* Venue or Link */}
            {modalEvent.eventType === 'in-person' ? (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>{t.venue}</p>
                <p style={{ color: '#1f2937' }}>{modalEvent.venue || 'TBD'}</p>
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Event Link</p>
                <a href={modalEvent.eventLink} target="_blank" rel="noopener noreferrer" style={{ color: '#2d5016', textDecoration: 'underline' }}>
                  {modalEvent.eventLink || 'N/A'}
                </a>
              </div>
            )}

            {/* Details Confirmed - ONLY if present */}
            {modalEvent.detailsConfirmed !== undefined && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Details Status</p>
                <p style={{ color: '#1f2937' }}>{modalEvent.detailsConfirmed ? 'Confirmed' : 'To Be Confirmed'}</p>
              </div>
            )}

            {/* Contact - ONLY if has value - Extract from array */}
            {modalEvent.contacts && Array.isArray(modalEvent.contacts) && modalEvent.contacts.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>{t.contact}</p>
                <div style={{ color: '#1f2937' }}>
                  {modalEvent.contacts.map((contact: any, idx: number) => (
                    <div key={idx}>
                      <p style={{ margin: '4px 0' }}>
                        {contact.name}
                        {contact.email && <span> • {contact.email}</span>}
                        {contact.phone && <span> • {contact.phone}</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Link - ONLY if has value */}
            {modalEvent.ticketLink && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Tickets</p>
                <a href={modalEvent.ticketLink} target="_blank" rel="noopener noreferrer" style={{ color: '#2d5016', textDecoration: 'underline' }}>
                  {modalEvent.ticketLink}
                </a>
              </div>
            )}

            {/* Buttons */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {modalEvent.ticketLink && (
                <a href={modalEvent.ticketLink} target="_blank" rel="noopener noreferrer" 
                  style={{ display: 'block', width: '100%', padding: '10px', backgroundColor: '#2d5016', color: 'white', textAlign: 'center', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
                  {t.buyTickets}
                </a>
              )}
              <button 
                onClick={() => {
                  const startTime = modalEvent.time.split(' - ')[0];
                  const endTime = modalEvent.time.split(' - ')[1];
                  const startDate = new Date(modalEvent.date + 'T' + startTime);
                  const endDate = new Date(modalEvent.date + 'T' + endTime);
                  
                  const formatDate = (date: Date) => {
                    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
                  };

                  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//e'Bosch//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${modalEvent.date}-${modalEvent.event}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${modalEvent.event}
DESCRIPTION:${modalEvent.event}
LOCATION:${modalEvent.venue || ''}
END:VEVENT
END:VCALENDAR`;

                  const blob = new Blob([icsContent], { type: 'text/calendar' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${modalEvent.event.replace(/\s+/g, '_')}.ics`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                style={{ width: '100%', padding: '10px', backgroundColor: '#a1f5d8', color: '#000000', textAlign: 'center', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                Add to Calendar
              </button>
              <button onClick={() => setModalOpen(false)} 
                style={{ width: '100%', padding: '10px', backgroundColor: '#e5e7eb', color: '#1f2937', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
