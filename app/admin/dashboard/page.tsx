'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Plus, X, LogOut } from 'lucide-react';

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
        // Safely handle contacts - ensure it's always an array of contact objects
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
      // Filter contacts - only save if name exists
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm py-6 mb-12">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold" style={{ color: '#2d5016' }}>
            e'Bosch Admin
          </h1>
          <button
            onClick={() => signOut(auth).then(() => router.push('/admin'))}
            className="px-6 py-2 rounded-lg font-semibold text-white text-base flex items-center gap-2"
            style={{ backgroundColor: '#a1f5d8', color: '#000000' }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="flex justify-center px-4 pb-12">
        <div style={{ maxWidth: '600px', width: '100%' }}>
          {/* Add Button */}
          {!showForm && (
            <div className="text-center mb-12">
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="px-10 py-3 rounded-lg font-semibold text-white text-lg flex items-center gap-2 mx-auto"
                style={{ backgroundColor: '#a1f5d8', color: '#000000' }}
              >
                <Plus size={20} /> Add New Event
              </button>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-10 mb-12">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-bold" style={{ color: '#2d5016' }}>
                  {editingId ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X size={28} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                {/* Event Name */}
                <div>
                  <label className="block font-bold text-lg mb-3" style={{ color: '#2d5016' }}>
                    <strong>Event Name</strong> *
                  </label>
                  <textarea
                    required
                    value={form.event}
                    onChange={(e) => setForm({...form, event: e.target.value})}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-500"
                    placeholder="Enter event name"
                    rows={3}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block font-bold text-lg mb-3" style={{ color: '#2d5016' }}>
                    <strong>Date</strong> *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-500"
                  />
                </div>

                {/* Times */}
                <div>
                  <label className="block font-bold text-lg mb-3" style={{ color: '#2d5016' }}>
                    <strong>Time</strong> *
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-base font-semibold mb-2 block text-gray-700">Start Time</label>
                      <input
                        type="time"
                        required
                        value={form.startTime}
                        onChange={(e) => setForm({...form, startTime: e.target.value})}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-base font-semibold mb-2 block text-gray-700">End Time</label>
                      <input
                        type="time"
                        required
                        value={form.endTime}
                        onChange={(e) => setForm({...form, endTime: e.target.value})}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Type */}
                <div>
                  <label className="block font-bold text-lg mb-4" style={{ color: '#2d5016' }}>
                    <strong>Event Type</strong> *
                  </label>
                  <div className="flex flex-col gap-5">
                    <label className="flex items-center gap-2 text-base font-semibold cursor-pointer">
                      <input
                        type="radio"
                        value="in-person"
                        checked={form.eventType === 'in-person'}
                        onChange={(e) => setForm({...form, eventType: e.target.value, venue: '', eventLink: ''})}
                        className="w-5 h-5"
                      />
                      In Person
                    </label>
                    <label className="flex items-center gap-2 text-base font-semibold cursor-pointer">
                      <input
                        type="radio"
                        value="online"
                        checked={form.eventType === 'online'}
                        onChange={(e) => setForm({...form, eventType: e.target.value, venue: '', eventLink: ''})}
                        className="w-5 h-5"
                      />
                      Online
                    </label>
                  </div>
                </div>

                {/* Venue or Link */}
                {form.eventType === 'in-person' ? (
                  <div>
                    <label className="block font-bold text-lg mb-3" style={{ color: '#2d5016' }}>
                      <strong>Venue</strong> {!form.detailsConfirmed && '*'}
                    </label>
                    <input
                      type="text"
                      value={form.venue}
                      onChange={(e) => setForm({...form, venue: e.target.value})}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-500"
                      placeholder="Enter venue"
                      required={form.detailsConfirmed}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-lg mb-3" style={{ color: '#2d5016' }}>
                      <strong>Event Link</strong> *
                    </label>
                    <input
                      type="url"
                      value={form.eventLink}
                      onChange={(e) => setForm({...form, eventLink: e.target.value})}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-500"
                      placeholder="https://..."
                      required
                    />
                  </div>
                )}

                {/* Details Confirmed */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center gap-2 text-base cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.detailsConfirmed}
                      onChange={(e) => setForm({...form, detailsConfirmed: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">Details Confirmed</span>
                    <span className="text-sm text-gray-600">(uncheck if To Be Confirmed)</span>
                  </label>
                </div>

                {/* Contact Persons */}
                <div>
                  <label className="block font-bold text-lg mb-4" style={{ color: '#2d5016' }}>
                    <strong>Contact Person(s)</strong> (optional)
                  </label>
                  <div className="space-y-5">
                    {form.contacts.map((contact, idx) => (
                      <div key={idx} className="border-2 border-gray-300 rounded-lg p-5 relative bg-gray-50">
                        {form.contacts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeContact(idx)}
                            className="absolute top-3 right-3 p-1 hover:bg-gray-200 rounded"
                          >
                            <X size={20} />
                          </button>
                        )}
                        <div className="space-y-4 pr-6">
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => updateContact(idx, 'name', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg text-base"
                            placeholder="Name"
                          />
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateContact(idx, 'email', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg text-base"
                            placeholder="Email (optional)"
                          />
                          <input
                            type="tel"
                            value={contact.phone}
                            onChange={(e) => updateContact(idx, 'phone', e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg text-base"
                            placeholder="Phone (optional)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addContact}
                    className="mt-4 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold text-base hover:bg-gray-50"
                  >
                    + Add Another Contact
                  </button>
                </div>

                {/* Click to Buy */}
                <div>
                  <label className="block font-bold text-lg mb-3" style={{ color: '#2d5016' }}>
                    <strong>Click to Buy</strong> (optional)
                  </label>
                  <input
                    type="url"
                    value={form.clickToBuyLink}
                    onChange={(e) => setForm({...form, clickToBuyLink: e.target.value})}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-500"
                    placeholder="https://..."
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    className="px-10 py-3 rounded-lg font-semibold text-white text-base"
                    style={{ backgroundColor: '#a1f5d8', color: '#000000' }}
                  >
                    {editingId ? 'Update Event' : 'Add Event'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Events List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-white border-b-2 border-gray-300 p-6">
              <h2 className="text-2xl font-bold" style={{ color: '#2d5016' }}>
                Events ({events.length})
              </h2>
            </div>

            {events.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-base">No events yet. Click Add New Event to get started!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="p-4 text-left font-bold text-base">Date</th>
                      <th className="p-4 text-left font-bold text-base">Event</th>
                      <th className="p-4 text-left font-bold text-base">Time</th>
                      <th className="p-4 text-left font-bold text-base">Type</th>
                      <th className="p-4 text-left font-bold text-base">Venue/Link</th>
                      <th className="p-4 text-left font-bold text-base">Contact</th>
                      <th className="p-4 text-left font-bold text-base">Details</th>
                      <th className="p-4 text-left font-bold text-base">Tickets</th>
                      <th className="p-4 text-right font-bold text-base">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => {
                      // Safely render contact names - only strings, never objects
                      const contactNames = e.contacts && Array.isArray(e.contacts)
                        ? e.contacts
                            .filter((c: any) => c && typeof c === 'object' && c.name)
                            .map((c: any) => c.name)
                            .join(', ')
                        : '';
                      
                      return (
                        <tr key={e.id} className="border-b border-gray-300 hover:bg-gray-50">
                          <td className="p-4 text-base">{e.date}</td>
                          <td className="p-4 text-base font-semibold">{e.event}</td>
                          <td className="p-4 text-base">{e.startTime} - {e.endTime}</td>
                          <td className="p-4 text-base capitalize">{e.eventType}</td>
                          <td className="p-4 text-base text-sm">{e.eventType === 'in-person' ? e.venue : e.eventLink ? 'Link set' : '-'}</td>
                          <td className="p-4 text-base">{contactNames || '-'}</td>
                          <td className="p-4 text-base">{e.detailsConfirmed ? 'Confirmed' : 'TBD'}</td>
                          <td className="p-4 text-base">{e.clickToBuyLink ? 'Yes' : 'No'}</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleEdit(e)}
                              className="px-3 py-1 text-blue-600 font-semibold hover:bg-blue-50 rounded text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(e.id)}
                              className="px-3 py-1 text-red-600 font-semibold hover:bg-red-50 rounded text-sm"
                            >
                              Delete
                            </button>
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
    </div>
  );
}
