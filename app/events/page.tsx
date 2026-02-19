'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';

type Language = 'en' | 'af' | 'xh';

interface PastEvent {
  id: string;
  titleEn: string;
  titleAf: string;
  titleXh: string;
  descriptionEn: string;
  descriptionAf: string;
  descriptionXh: string;
  images: string[];
  createdAt: any;
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

export default function EventsPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [selectedImageIndexes, setSelectedImageIndexes] = useState<{ [key: string]: number }>({});
  const [pastPage, setPastPage] = useState(1);
  const pastEventsPerPage = 2;
  
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 15));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState<CalendarEvent | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Request event modal – now with startTime and endTime
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    eventName: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Load past events from Firestore
  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        const q = query(collection(db, 'pastEvents'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as PastEvent[];
        setPastEvents(data);
        // Initialize selected image index for each event
        const initialIndexes: { [key: string]: number } = {};
        data.forEach(e => { initialIndexes[e.id] = 0; });
        setSelectedImageIndexes(initialIndexes);
      } catch (error) {
        console.error('Error fetching past events:', error);
      }
    };
    fetchPastEvents();
  }, []);

  // Load calendar events
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pagination
  const totalPastPages = Math.ceil(pastEvents.length / pastEventsPerPage);
  const currentPastEvents = pastEvents.slice(
    (pastPage - 1) * pastEventsPerPage,
    pastPage * pastEventsPerPage
  );

  // Translations with distinct keys for suggestion form
  const translations = {
    en: {
      home: 'Home',
      about: 'About',
      events: 'Events',
      publicity: 'Publicity',
      contact: 'Contact',
      calendarTitle: 'Event Calendar',
      noEventsMessage: 'Click on a date with events to see details',
      time: 'Time',
      venue: 'Venue',
      contactLabel: 'Contact',
      buyTickets: 'Buy Tickets',
      // Suggestion form keys
      suggestEvent: 'Suggest an Event',
      formEventName: 'Event Name',
      formDate: 'Date',
      formStartTime: 'Start Time',
      formEndTime: 'End Time',
      formVenue: 'Venue / Online Link',
      formDescription: 'Description',
      formContactName: 'Contact Name',
      formContactEmail: 'Contact Email',
      formContactPhone: 'Contact Phone',
      cancel: 'Cancel',
      submit: 'Submit',
      submitting: 'Submitting...',
      submitSuccess: 'Thank you! Your event suggestion has been submitted for review.',
      submitError: 'Error submitting. Please try again.',
    },
    af: {
      home: 'Tuis',
      about: 'Oor Ons',
      events: 'Geleenthede',
      publicity: 'Publisiteit',
      contact: 'Kontak',
      calendarTitle: 'Gebeure Kalender',
      noEventsMessage: "Klik op 'n datum met geleenthede vir besonderhede",
      time: 'Tyd',
      venue: 'Plek',
      contactLabel: 'Kontak',
      buyTickets: 'Koop Kaartjies',
      // Suggestion form keys
      suggestEvent: 'Stel \'n Gebeurtenis Voor',
      formEventName: 'Gebeurtenis Naam',
      formDate: 'Datum',
      formStartTime: 'Begintyd',
      formEndTime: 'Eindtyd',
      formVenue: 'Lokaal / Aanlyn Skakel',
      formDescription: 'Beskrywing',
      formContactName: 'Kontak Naam',
      formContactEmail: 'Kontak E-pos',
      formContactPhone: 'Kontak Foon',
      cancel: 'Kanselleer',
      submit: 'Stuur In',
      submitting: 'Besig om in te dien...',
      submitSuccess: 'Dankie! U gebeurtenisvoorstel is ingestuur vir hersiening.',
      submitError: 'Fout met indiening. Probeer asseblief weer.',
    },
    xh: {
      home: 'Ikhaya',
      about: 'Malunga',
      events: 'Iziganeko',
      publicity: 'Isaziso',
      contact: 'Xhomekela',
      calendarTitle: 'Ikhalenda yoMsitho',
      noEventsMessage: 'Cofa umhla one events ukuze ubone iinkcukacha',
      time: 'Ixesha',
      venue: 'Indawo',
      contactLabel: 'Unxibelelwano',
      buyTickets: 'Thenga Itikhiti',
      // Suggestion form keys
      suggestEvent: 'Cebisa uMsitho',
      formEventName: 'Igama loMsitho',
      formDate: 'Umhla',
      formStartTime: 'Ixesha lokuQala',
      formEndTime: 'Ixesha lokuPhela',
      formVenue: 'Indawo / Ikhonkco le-Intanethi',
      formDescription: 'Inkcazelo',
      formContactName: 'Igama loQhagamshelwano',
      formContactEmail: 'I-imeyile yoQhagamshelwano',
      formContactPhone: 'Umnxeba woQhagamshelwano',
      cancel: 'Rhoxisa',
      submit: 'Thumela',
      submitting: 'Iyathumela...',
      submitSuccess: 'Enkosi! Isicelo sakho somsitho singeniselwe ukuphononongwa.',
      submitError: 'Impazamo ekungeniseni. Nceda uzame kwakhona.',
    },
  };

  const t = translations[language];

  // Calendar helpers
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

  const monthNames = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    af: ['Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie', 'Julie', 'Augustus', 'September', 'Oktober', 'November', 'Desember'],
    xh: ['EyoMqungu', 'EyoMdumba', 'EyoKwindla', 'UTshazimpuzi', 'UCanzibe', 'EyeSilimela', 'EyeKhala', 'EyeThupha', 'EyoMsintsi', 'EyeDwarha', 'EyeNkanga', 'EyoMnga']
  };

  const monthName = `${monthNames[language][selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  const navLinkStyle = {
    textDecoration: 'none',
    color: '#4b5563',
    fontSize: '16px',
    fontWeight: '500',
    paddingBottom: '4px',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease'
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.target as HTMLElement).style.color = '#2d5016';
    (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.target as HTMLElement).style.color = '#4b5563';
    (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage('');
    try {
      // Combine startTime and endTime into a single "time" string for storage (optional)
      const timeString = `${requestForm.startTime} - ${requestForm.endTime}`;
      await addDoc(collection(db, 'eventRequests'), {
        ...requestForm,
        time: timeString, // store combined time as well
        status: 'pending',
        createdAt: new Date(),
      });
      setSubmitMessage(t.submitSuccess);
      setRequestForm({
        eventName: '', date: '', startTime: '', endTime: '', venue: '',
        description: '', contactName: '', contactEmail: '', contactPhone: ''
      });
      setTimeout(() => {
        setShowRequestModal(false);
        setSubmitMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting request:', error);
      setSubmitMessage(t.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header (unchanged) */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'white',
        boxShadow: 'none'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <Link href="/" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {t.home}
              </Link>
              <Link href="/about" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {t.about}
              </Link>
              <Link href="/events" style={{
                textDecoration: 'none',
                color: '#2d5016',
                fontSize: '16px',
                fontWeight: '600',
                paddingBottom: '4px',
                borderBottom: '2px solid #2d5016',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.7'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}>
                {t.events}
              </Link>
              <Link href="/store" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && "e'Bosch Store"}
                {language === 'af' && "e'Bosch Winkel"}
                {language === 'xh' && "e'Bosch Inkolo"}
              </Link>
              <Link href="/membership" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Membership'}
                {language === 'af' && 'Lidmaatskap'}
                {language === 'xh' && 'Ubulungu'}
              </Link>
              <Link href="/publicity" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {t.publicity}
              </Link>
              <Link href="/contact" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {t.contact}
              </Link>
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

      <main className="max-w-7xl mx-auto px-4 py-16" style={{ paddingTop: '100px' }}>
        {/* Past Events Gallery (unchanged) */}
        {currentPastEvents.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {currentPastEvents.map((event) => {
                const currentIndex = selectedImageIndexes[event.id] || 0;
                const currentImage = event.images[currentIndex];
                const title = language === 'en' ? event.titleEn : language === 'af' ? event.titleAf : event.titleXh;
                const description = language === 'en' ? event.descriptionEn : language === 'af' ? event.descriptionAf : event.descriptionXh;

                return (
                  <div key={event.id}>
                    <div className="mb-4 max-w-xs">
                      <h2 className="text-xl font-bold mb-2" style={{ color: '#2d5016' }}>
                        {title}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {description}
                      </p>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex-shrink-0">
                        <img
                          src={currentImage}
                          alt={title}
                          className="rounded-lg shadow-lg"
                          style={{ width: '380px', height: '380px', objectFit: 'contain', backgroundColor: '#ffffff' }}
                        />
                      </div>
                      <div className="flex-shrink-0">
                        <div className="grid grid-cols-2 gap-2">
                          {event.images.map((img: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImageIndexes({...selectedImageIndexes, [event.id]: idx})}
                              className={`rounded-lg overflow-hidden transition-all cursor-pointer ${
                                idx === currentIndex ? 'ring-3 ring-green-600 shadow-lg' : 'hover:shadow-md opacity-70 hover:opacity-100'
                              }`}
                              style={{ width: '60px', height: '60px' }}
                            >
                              <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition"
                              />
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-2 text-center">
                          {currentIndex + 1} / {event.images.length}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPastPages > 1 && (
              <div className="flex justify-center gap-4 mb-16">
                <button
                  onClick={() => setPastPage(p => Math.max(1, p - 1))}
                  disabled={pastPage === 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: pastPage === 1 ? '#e5e7eb' : '#2d5016',
                    color: pastPage === 1 ? '#9ca3af' : 'white',
                    border: 'none',
                    cursor: pastPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>
                <span style={{ alignSelf: 'center', color: '#4b5563' }}>
                  Page {pastPage} of {totalPastPages}
                </span>
                <button
                  onClick={() => setPastPage(p => Math.min(totalPastPages, p + 1))}
                  disabled={pastPage === totalPastPages}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: pastPage === totalPastPages ? '#e5e7eb' : '#2d5016',
                    color: pastPage === totalPastPages ? '#9ca3af' : 'white',
                    border: 'none',
                    cursor: pastPage === totalPastPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Calendar Section with Title and Button */}
        <div style={{ marginTop: '80px', paddingTop: '20px' }}>
          {/* Centered title and button */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <h2 className="text-3xl font-bold" style={{ color: '#2d5016', margin: 0 }}>{t.calendarTitle}</h2>
            <button
              onClick={() => setShowRequestModal(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2d5016',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {t.suggestEvent} <span style={{ fontSize: '20px' }}>→</span>
            </button>
          </div>

          {/* Calendar (unchanged) */}
          <div className="bg-white rounded-xl shadow-lg p-8 mx-auto" style={{ maxWidth: '1000px' }}>
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded">←</button>
              <h3 className="text-2xl font-bold" style={{ color: '#4b5563' }}>{monthName}</h3>
              <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded">→</button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center font-bold text-gray-700 py-3">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {renderCalendar().map((week, wi) => week.map((day, di) => {
                const dayEvents = getEventsForDate(day);
                const isToday = day?.toDateString() === new Date().toDateString();
                const greenShades = ['#2d5016', '#16a34a', '#059669', '#10b981', '#14b8a6'];

                return (
                  <button
                    key={`${wi}-${di}`}
                    onClick={() => day && handleDayClick(day)}
                    className="aspect-square rounded-lg font-semibold transition flex flex-col items-center justify-center relative hover:shadow-md"
                    style={{
                      backgroundColor: isToday ? '#9ca8a0' : '#f9fafb',
                      color: isToday ? 'white' : '#4b5563',
                      cursor: day ? 'pointer' : 'default',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s',
                      overflow: 'visible',
                      paddingBottom: dayEvents.length > 0 ? '18px' : '0'
                    }}
                  >
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

        {/* Request Modal (unchanged) */}
        {showRequestModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white', borderRadius: '12px', padding: '32px',
              maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d5016', marginBottom: '16px' }}>
                {t.suggestEvent}
              </h2>
              {submitMessage ? (
                <p style={{ color: submitMessage.includes('Error') ? '#dc2626' : '#10b981', marginBottom: '16px' }}>
                  {submitMessage}
                </p>
              ) : (
                <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input
                    type="text"
                    placeholder={t.formEventName}
                    value={requestForm.eventName}
                    onChange={e => setRequestForm({...requestForm, eventName: e.target.value})}
                    required
                    style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <input
                    type="date"
                    placeholder={t.formDate}
                    value={requestForm.date}
                    onChange={e => setRequestForm({...requestForm, date: e.target.value})}
                    required
                    style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input
                      type="time"
                      placeholder={t.formStartTime}
                      value={requestForm.startTime}
                      onChange={e => setRequestForm({...requestForm, startTime: e.target.value})}
                      required
                      style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <input
                      type="time"
                      placeholder={t.formEndTime}
                      value={requestForm.endTime}
                      onChange={e => setRequestForm({...requestForm, endTime: e.target.value})}
                      required
                      style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder={t.formVenue}
                    value={requestForm.venue}
                    onChange={e => setRequestForm({...requestForm, venue: e.target.value})}
                    required
                    style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <textarea
                    placeholder={t.formDescription}
                    value={requestForm.description}
                    onChange={e => setRequestForm({...requestForm, description: e.target.value})}
                    required
                    rows={3}
                    style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }}
                  />
                  <input
                    type="text"
                    placeholder={t.formContactName}
                    value={requestForm.contactName}
                    onChange={e => setRequestForm({...requestForm, contactName: e.target.value})}
                    required
                    style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <input
                    type="email"
                    placeholder={t.formContactEmail}
                    value={requestForm.contactEmail}
                    onChange={e => setRequestForm({...requestForm, contactEmail: e.target.value})}
                    required
                    style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <input
                    type="tel"
                    placeholder={t.formContactPhone}
                    value={requestForm.contactPhone}
                    onChange={e => setRequestForm({...requestForm, contactPhone: e.target.value})}
                    style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#2d5016',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {submitting ? t.submitting : t.submit}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Event Modal (unchanged) */}
      {modalOpen && modalEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', margin: '20px auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#2d5016' }}>{modalEvent.event}</h3>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Date</p>
              <p style={{ color: '#1f2937' }}>{modalEvent.date}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>{t.time}</p>
              <p style={{ color: '#1f2937' }}>{modalEvent.time}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Event Type</p>
              <p style={{ color: '#1f2937', textTransform: 'capitalize' }}>{modalEvent.eventType}</p>
            </div>

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

            {modalEvent.contacts && Array.isArray(modalEvent.contacts) && modalEvent.contacts.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>{t.contactLabel}</p>
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

            {modalEvent.ticketLink && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>Tickets</p>
                <a href={modalEvent.ticketLink} target="_blank" rel="noopener noreferrer" style={{ color: '#2d5016', textDecoration: 'underline' }}>
                  {modalEvent.ticketLink}
                </a>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {modalEvent.ticketLink && new Date(modalEvent.date) >= new Date(new Date().toDateString()) && (
                <a href={modalEvent.ticketLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', width: '100%', padding: '10px', backgroundColor: '#2d5016', color: 'white', textAlign: 'center', borderRadius: '6px', textDecoration: 'none', fontWeight: 'normal' }}>
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
                style={{ width: '100%', padding: '10px', backgroundColor: '#4a5240', color: 'white', textAlign: 'center', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
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