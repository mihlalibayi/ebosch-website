'use client';

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '@/lib/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, X, Edit2, Trash2, Calendar, Clock, MapPin, User } from 'lucide-react';

interface Contact {
  name: string;
  email: string;
  phone: string;
}

interface Event {
  id: string;
  event: string;
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  eventLink?: string;
  venue: string;
  contacts: Contact[];
  detailsConfirmed: boolean;
  clickToBuyLink: string;
  createdBy: string; // ✅ new field
  images?: string[];
}

export default function AdminEvents() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'az' | 'za' | 'date-asc' | 'date-desc'>('date-asc');
  const [showMyEventsOnly, setShowMyEventsOnly] = useState(false); // ✅ filter

  // Image upload state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    event: '',
    date: '',
    startTime: '',
    endTime: '',
    eventType: 'in-person',
    eventLink: '',
    venue: '',
    contacts: [{ name: '', email: '', phone: '' }],
    detailsConfirmed: true,
    clickToBuyLink: '',
    images: [] as string[],
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsAdmin(currentUser.email === 'members.ebosch@gmail.com');
        loadEvents();
      } else {
        // Should not happen because dashboard already checks auth, but handle gracefully
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const loadEvents = async () => {
    try {
      const snap = await getDocs(collection(db, 'events'));
      const data = snap.docs.map(d => {
        const docData = d.data() as any;
        let contacts: Contact[] = [];
        if (Array.isArray(docData.contacts)) {
          contacts = docData.contacts.map((c: any) => ({
            name: typeof c === 'object' && c?.name ? c.name : '',
            email: typeof c === 'object' && c?.email ? c.email : '',
            phone: typeof c === 'object' && c?.phone ? c.phone : '',
          }));
        }
        return {
          id: d.id,
          event: docData.event || '',
          date: docData.date || '',
          startTime: docData.startTime || '',
          endTime: docData.endTime || '',
          eventType: docData.eventType || 'in-person',
          eventLink: docData.eventLink || '',
          venue: docData.venue || '',
          contacts,
          detailsConfirmed: docData.detailsConfirmed ?? true,
          clickToBuyLink: docData.clickToBuyLink || '',
          createdBy: docData.createdBy || '',
          images: docData.images || [],
        } as Event;
      });
      setEvents(data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const uploadImages = async (eventId: string, files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const imageRef = ref(storage, `events/${eventId}/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      urls.push(url);
    }
    return urls;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUploading(true);
    try {
      const contactsToSave = form.contacts.filter((c: Contact) => c.name.trim().length > 0);

      const saveData = {
        event: form.event,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        time: `${form.startTime} - ${form.endTime}`,
        eventType: form.eventType,
        eventLink: form.eventType === 'online' ? form.eventLink : '',
        venue: form.eventType === 'in-person' ? form.venue : '',
        contacts: contactsToSave,
        detailsConfirmed: form.detailsConfirmed,
        clickToBuyLink: form.clickToBuyLink,
        ticketLink: form.clickToBuyLink,
        images: form.images,
        // ✅ set createdBy only when creating new event
        ...(editingId ? {} : { createdBy: user.uid }),
      };

      let eventId = editingId;

      if (editingId) {
        await updateDoc(doc(db, 'events', editingId), saveData);
      } else {
        const docRef = await addDoc(collection(db, 'events'), saveData);
        eventId = docRef.id;
      }

      // Upload new images if any
      if (imageFiles.length > 0 && eventId) {
        const newUrls = await uploadImages(eventId, imageFiles);
        const updatedImages = [...(form.images || []), ...newUrls];
        await updateDoc(doc(db, 'events', eventId), { images: updatedImages });
      }

      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      event: '',
      date: '',
      startTime: '',
      endTime: '',
      eventType: 'in-person',
      eventLink: '',
      venue: '',
      contacts: [{ name: '', email: '', phone: '' }],
      detailsConfirmed: true,
      clickToBuyLink: '',
      images: [],
    });
    setImageFiles([]);
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteDoc(doc(db, 'events', id));
      loadEvents();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleEdit = (event: Event) => {
    setForm({
      event: event.event || '',
      date: event.date || '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      eventType: event.eventType || 'in-person',
      eventLink: event.eventLink || '',
      venue: event.venue || '',
      contacts: event.contacts.length ? event.contacts : [{ name: '', email: '', phone: '' }],
      detailsConfirmed: event.detailsConfirmed !== undefined ? event.detailsConfirmed : true,
      clickToBuyLink: event.clickToBuyLink || '',
      images: event.images || [],
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const addContact = () => {
    setForm({ ...form, contacts: [...form.contacts, { name: '', email: '', phone: '' }] });
  };

  const removeContact = (index: number) => {
    setForm({ ...form, contacts: form.contacts.filter((_, i) => i !== index) });
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const newContacts = [...form.contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setForm({ ...form, contacts: newContacts });
  };

  // Filtering and sorting
  const filteredEvents = events
    .filter(ev => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          ev.event.toLowerCase().includes(q) ||
          ev.venue.toLowerCase().includes(q) ||
          ev.contacts.some(c => c.name.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }
      // My events filter
      if (showMyEventsOnly && user) {
        return ev.createdBy === user.uid;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'az') return a.event.localeCompare(b.event);
      if (sortBy === 'za') return b.event.localeCompare(a.event);
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });

  // Permission helpers
  const canEdit = (event: Event) => {
    if (isAdmin) return true;
    return user && event.createdBy === user.uid;
  };

  const canDelete = (event: Event) => {
    return isAdmin;
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
          Events Management
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Create, edit, and manage your events
        </p>
      </div>

      {!showForm && (
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 'normal',
              fontSize: '14px',
              backgroundColor: '#2d5016',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={18} /> Add New Event
          </button>
        </div>
      )}

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0' }}>
              {editingId ? 'Edit Event' : 'Add New Event'}
            </h2>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Event Name */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Event Name *</label>
              <input
                type="text"
                value={form.event}
                onChange={(e) => setForm({ ...form, event: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Date and Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Event Type *</label>
                <select
                  value={form.eventType}
                  onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="in-person">In-Person</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>

            {/* Start and End Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Start Time *</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>End Time *</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Venue or Link */}
            {form.eventType === 'in-person' && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Venue *</label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="Event venue"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {form.eventType === 'online' && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Event Link *</label>
                <input
                  type="url"
                  value={form.eventLink}
                  onChange={(e) => setForm({ ...form, eventLink: e.target.value })}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Ticket Link */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Click to Buy Link</label>
              <input
                type="url"
                value={form.clickToBuyLink}
                onChange={(e) => setForm({ ...form, clickToBuyLink: e.target.value })}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Event Images (max 10)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length + (form.images?.length || 0) > 10) {
                    alert('Maximum 10 images allowed');
                    return;
                  }
                  setImageFiles(files);
                }}
                style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              {form.images && form.images.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {form.images.map((url, idx) => (
                    <img key={idx} src={url} alt={`Existing ${idx}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  ))}
                </div>
              )}
              {imageFiles.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>New images to upload:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {imageFiles.map((file, idx) => (
                      <img key={idx} src={URL.createObjectURL(file)} alt={`Preview ${idx}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contacts */}
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>Contact Persons</h3>
                <button type="button" onClick={addContact} style={{ padding: '6px 12px', backgroundColor: '#f0fdf4', color: '#2d5016', border: '1px solid #d1fae5', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  + Add Contact
                </button>
              </div>

              {form.contacts.map((contact, index) => (
                <div key={index} style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Contact {index + 1}</span>
                    {index > 0 && (
                      <button type="button" onClick={() => removeContact(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <input type="text" value={contact.name} onChange={(e) => updateContact(index, 'name', e.target.value)} placeholder="Name" style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }} />
                    <input type="email" value={contact.email} onChange={(e) => updateContact(index, 'email', e.target.value)} placeholder="Email" style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }} />
                    <input type="tel" value={contact.phone} onChange={(e) => updateContact(index, 'phone', e.target.value)} placeholder="Phone" style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Details Confirmed */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="detailsConfirmed" checked={form.detailsConfirmed} onChange={(e) => setForm({...form, detailsConfirmed: e.target.checked})} />
              <label htmlFor="detailsConfirmed" style={{ fontSize: '14px', color: '#374151' }}>Details Confirmed</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                backgroundColor: uploading ? '#9ca3af' : '#2d5016',
                color: 'white',
                border: 'none',
                cursor: uploading ? 'not-allowed' : 'pointer',
              }}
            >
              {uploading ? 'Uploading...' : (editingId ? 'Update Event' : 'Add Event')}
            </button>
          </form>
        </div>
      )}

      {/* Search, Filter, Sort */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <div style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0' }}>
              Events ({filteredEvents.length}{filteredEvents.length !== events.length ? ` of ${events.length}` : ''})
            </h2>
            {/* ✅ My Events Toggle */}
            {user && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={showMyEventsOnly}
                  onChange={(e) => setShowMyEventsOnly(e.target.checked)}
                />
                Show only my events
              </label>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by name, venue or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white' }}
            />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} style={{ padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', minWidth: '170px' }}>
              <option value="az">Name · A to Z</option>
              <option value="za">Name · Z to A</option>
              <option value="date-asc">Date · Oldest First</option>
              <option value="date-desc">Date · Newest First</option>
            </select>
            {(searchQuery.trim() || showMyEventsOnly) && (
              <button onClick={() => { setSearchQuery(''); setShowMyEventsOnly(false); }}
                style={{ padding: '8px 14px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 'normal' }}>
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Events Table */}
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: '0.5' }} />
            <p>No events yet. Click "Add New Event" to get started!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Event</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Time</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Type</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Location</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Contact</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#2d5016', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev, idx) => {
                  const contactNames = ev.contacts?.map(c => c.name).join(', ') || '-';
                  return (
                    <tr key={ev.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{ev.date}</td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{ev.event}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{ev.startTime} - {ev.endTime}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '6px', backgroundColor: ev.eventType === 'in-person' ? '#dbeafe' : '#fef3c7', color: ev.eventType === 'in-person' ? '#0369a1' : '#92400e' }}>
                          {ev.eventType === 'in-person' ? 'In-Person' : 'Online'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{ev.eventType === 'in-person' ? ev.venue : ev.eventLink ? 'Link set' : '-'}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{contactNames}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '6px', backgroundColor: ev.detailsConfirmed ? '#dcfce7' : '#fee2e2', color: ev.detailsConfirmed ? '#166534' : '#991b1b' }}>
                          {ev.detailsConfirmed ? 'Confirmed' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {canEdit(ev) && (
                            <button
                              onClick={() => handleEdit(ev)}
                              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#2d5016' }}
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                          )}
                          {canDelete(ev) && (
                            <button
                              onClick={() => handleDelete(ev.id)}
                              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#dc2626' }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}