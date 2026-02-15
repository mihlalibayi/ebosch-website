'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Plus, X, LogOut, Edit2, Trash2, Calendar, Clock, MapPin, User } from 'lucide-react';

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
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

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
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || currentUser.email !== 'members.ebosch@gmail.com') {
        router.push('/admin');
      } else {
        setUser(currentUser);
        loadEvents();
      }
    });
    return unsubscribe;
  }, [router]);

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
          contacts: contacts.length > 0 ? contacts : [],
          detailsConfirmed: docData.detailsConfirmed ?? true,
          clickToBuyLink: docData.clickToBuyLink || '',
        } as Event;
      });
      setEvents(data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
      };

      if (editingId) {
        await updateDoc(doc(db, 'events', editingId), saveData);
      } else {
        await addDoc(collection(db, 'events'), saveData);
      }
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
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
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this event?')) {
      await deleteDoc(doc(db, 'events', id));
      loadEvents();
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
      contacts: event.contacts && event.contacts.length > 0 ? event.contacts : [{ name: '', email: '', phone: '' }],
      detailsConfirmed: event.detailsConfirmed !== undefined ? event.detailsConfirmed : true,
      clickToBuyLink: event.clickToBuyLink || '',
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const addContact = () => {
    setForm({
      ...form,
      contacts: [...form.contacts, { name: '', email: '', phone: '' }],
    });
  };

  const removeContact = (index: number) => {
    setForm({
      ...form,
      contacts: form.contacts.filter((_, i) => i !== index),
    });
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const newContacts = [...form.contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    setForm({ ...form, contacts: newContacts });
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div 
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: '#2d5016',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(45, 80, 22, 0.15)'
              }}
            >
              <img 
                src="/logo.jpg" 
                alt="e'Bosch"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0' }}>
                e'Bosch Admin
              </h1>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0 0' }}>
                Event Management Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut(auth).then(() => router.push('/admin'))}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#2d5016',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a3009';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 80, 22, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2d5016';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Add Event Button */}
        {!showForm && (
          <div style={{ marginBottom: '32px' }}>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              style={{
                padding: '14px 28px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '16px',
                backgroundColor: '#2d5016',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a3009';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(45, 80, 22, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2d5016';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Plus size={20} /> Add New Event
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '40px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#2d5016', margin: '0' }}>
                {editingId ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button 
                onClick={() => setShowForm(false)} 
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <X size={28} color="#6b7280" />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gap: '24px' }}>
              {/* Event Name */}
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#2d5016',
                  marginBottom: '10px'
                }}>
                  Event Name *
                </label>
                <textarea
                  required
                  value={form.event}
                  onChange={(e) => setForm({...form, event: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    minHeight: '100px'
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                  placeholder="Enter event name"
                  rows={3}
                />
              </div>

              {/* Date */}
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#2d5016',
                  marginBottom: '10px'
                }}>
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({...form, date: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                />
              </div>

              {/* Times */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontWeight: '600',
                    fontSize: '16px',
                    color: '#2d5016',
                    marginBottom: '10px'
                  }}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({...form, startTime: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontWeight: '600',
                    fontSize: '16px',
                    color: '#2d5016',
                    marginBottom: '10px'
                  }}>
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({...form, endTime: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                  />
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#2d5016',
                  marginBottom: '12px'
                }}>
                  Event Type *
                </label>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="in-person"
                      checked={form.eventType === 'in-person'}
                      onChange={(e) => setForm({...form, eventType: e.target.value, venue: '', eventLink: ''})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '15px', color: '#374151' }}>In Person</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="online"
                      checked={form.eventType === 'online'}
                      onChange={(e) => setForm({...form, eventType: e.target.value, venue: '', eventLink: ''})}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '15px', color: '#374151' }}>Online</span>
                  </label>
                </div>
              </div>

              {/* Venue or Link */}
              {form.eventType === 'in-person' ? (
                <div>
                  <label style={{
                    display: 'block',
                    fontWeight: '600',
                    fontSize: '16px',
                    color: '#2d5016',
                    marginBottom: '10px'
                  }}>
                    Venue
                  </label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={(e) => setForm({...form, venue: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                    placeholder="Enter venue"
                  />
                </div>
              ) : (
                <div>
                  <label style={{
                    display: 'block',
                    fontWeight: '600',
                    fontSize: '16px',
                    color: '#2d5016',
                    marginBottom: '10px'
                  }}>
                    Event Link *
                  </label>
                  <input
                    type="url"
                    value={form.eventLink}
                    onChange={(e) => setForm({...form, eventLink: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                    placeholder="https://..."
                    required
                  />
                </div>
              )}

              {/* Details Confirmed */}
              <div style={{
                backgroundColor: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.detailsConfirmed}
                    onChange={(e) => setForm({...form, detailsConfirmed: e.target.checked})}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '600', color: '#374151', fontSize: '15px' }}>Details Confirmed</span>
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>(uncheck if To Be Confirmed)</span>
                </label>
              </div>

              {/* Contact Persons */}
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#2d5016',
                  marginBottom: '16px'
                }}>
                  Contact Person(s)
                </label>
                <div style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
                  {form.contacts.map((contact, idx) => (
                    <div key={idx} style={{
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#f9fafb',
                      position: 'relative'
                    }}>
                      {form.contacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContact(idx)}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <X size={18} color="#ef4444" />
                        </button>
                      )}
                      <div style={{ display: 'grid', gap: '12px', paddingRight: '32px' }}>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => updateContact(idx, 'name', e.target.value)}
                          placeholder="Name"
                          style={{
                            padding: '10px 12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                          onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                        />
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContact(idx, 'email', e.target.value)}
                          placeholder="Email (optional)"
                          style={{
                            padding: '10px 12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                          onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                        />
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => updateContact(idx, 'phone', e.target.value)}
                          placeholder="Phone (optional)"
                          style={{
                            padding: '10px 12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                          onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addContact}
                  style={{
                    padding: '10px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontWeight: '600',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#2d5016';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  + Add Another Contact
                </button>
              </div>

              {/* Click to Buy */}
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#2d5016',
                  marginBottom: '10px'
                }}>
                  Click to Buy (optional)
                </label>
                <input
                  type="url"
                  value={form.clickToBuyLink}
                  onChange={(e) => setForm({...form, clickToBuyLink: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2d5016')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                  placeholder="https://..."
                />
              </div>

              {/* Submit */}
              <div style={{ paddingTop: '12px' }}>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    backgroundColor: '#2d5016',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a3009';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(45, 80, 22, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d5016';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {editingId ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderBottom: '2px solid #e5e7eb',
            padding: '20px 24px'
          }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#111827',
              margin: '0'
            }}>
              Events ({events.length})
            </h2>
          </div>

          {events.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 24px',
              color: '#6b7280'
            }}>
              <Calendar size={48} style={{ margin: '0 auto 16px', opacity: '0.5' }} />
              <p style={{ fontSize: '16px' }}>No events yet. Click "Add New Event" to get started!</p>
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
                  {events.map((e, idx) => {
                    const contactNames = e.contacts && Array.isArray(e.contacts)
                      ? e.contacts
                          .filter((c: any) => c && typeof c === 'object' && c.name)
                          .map((c: any) => c.name)
                          .join(', ')
                      : '';
                    
                    return (
                      <tr 
                        key={e.id} 
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(row) => (row.currentTarget.style.backgroundColor = '#f3f4f6')}
                        onMouseLeave={(row) => (row.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb')}
                      >
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={16} color="#6b7280" />
                            {e.date}
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{e.event}</td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={16} color="#6b7280" />
                            {e.startTime} - {e.endTime}
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            backgroundColor: e.eventType === 'in-person' ? '#dbeafe' : '#fef3c7',
                            color: e.eventType === 'in-person' ? '#0369a1' : '#92400e',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            {e.eventType === 'in-person' ? 'In-Person' : 'Online'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={16} color="#6b7280" />
                            {e.eventType === 'in-person' ? e.venue : e.eventLink ? 'Link set' : '-'}
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>{contactNames || '-'}</td>
                        <td style={{ padding: '16px', fontSize: '14px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            backgroundColor: e.detailsConfirmed ? '#dcfce7' : '#fee2e2',
                            color: e.detailsConfirmed ? '#166534' : '#991b1b',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            {e.detailsConfirmed ? 'Confirmed' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleEdit(e)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#2d5016',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0fdf4';
                                e.currentTarget.style.borderColor = '#2d5016';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                              }}
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(e.id)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#dc2626',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.borderColor = '#dc2626';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
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
    </div>
  );
}
