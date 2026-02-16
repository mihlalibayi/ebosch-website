'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-config';
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

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    loadEvents();
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
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a3009';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2d5016';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={18} />
            Add New Event
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
            <button
              onClick={() => resetForm()}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>Contact Persons</h3>
                <button
                  type="button"
                  onClick={addContact}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f0fdf4',
                    color: '#2d5016',
                    border: '1px solid #d1fae5',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  + Add Contact
                </button>
              </div>

              {form.contacts.map((contact, index) => (
                <div key={index} style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Contact {index + 1}</span>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeContact(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#dc2626',
                          padding: '4px'
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      placeholder="Name"
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContact(index, 'email', e.target.value)}
                      placeholder="Email"
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      placeholder="Phone"
                      style={{
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="detailsConfirmed"
                checked={form.detailsConfirmed}
                onChange={(e) => setForm({ ...form, detailsConfirmed: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="detailsConfirmed" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                Details Confirmed
              </label>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'normal',
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
          </form>
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
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
                              fontWeight: 'normal',
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
                              fontWeight: 'normal',
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
  );
}