'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { X, Edit2, Trash2, Plus } from 'lucide-react';

interface Event {
  id: string;
  date: string;
  time: string;
  event: string;
  venue: string;
  contact: string;
  ticketLink: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    event: '',
    venue: '',
    contact: '',
    ticketLink: '',
  });
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || currentUser.email !== 'members.ebosch@gmail.com') {
        router.push('/admin');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [router]);

  // Load events
  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'events'));
      const eventsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Event));
      // Sort by date
      eventsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing event
        await updateDoc(doc(db, 'events', editingId), formData);
        setEditingId(null);
      } else {
        // Add new event
        await addDoc(collection(db, 'events'), formData);
      }
      setFormData({
        date: '',
        time: '',
        event: '',
        venue: '',
        contact: '',
        ticketLink: '',
      });
      setShowForm(false);
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', id));
        loadEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleEditEvent = (event: Event) => {
    setFormData({
      date: event.date,
      time: event.time,
      event: event.event,
      venue: event.venue,
      contact: event.contact,
      ticketLink: event.ticketLink,
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: '#2d5016' }}>
            e'Bosch Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg font-semibold text-white transition"
            style={{ backgroundColor: '#2d5016' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a3009')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d5016')}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Event Button */}
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                date: '',
                time: '',
                event: '',
                venue: '',
                contact: '',
                ticketLink: '',
              });
            }}
            className="mb-8 px-6 py-3 rounded-lg font-semibold text-white transition flex items-center gap-2"
            style={{ backgroundColor: '#2d5016' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a3009')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d5016')}
          >
            <Plus size={20} />
            Add New Event
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#2d5016' }}>
                {editingId ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="grid grid-cols-2 gap-4">
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Date"
              />

              <input
                type="text"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Time (e.g., 09:00 - 12:00)"
              />

              <input
                type="text"
                required
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Contact Person"
              />

              <textarea
                required
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Event Name"
                rows={2}
              />

              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Venue"
              />

              <input
                type="text"
                value={formData.ticketLink}
                onChange={(e) => setFormData({ ...formData, ticketLink: e.target.value })}
                className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Ticket Link (optional)"
              />

              <button
                type="submit"
                className="col-span-2 px-6 py-3 rounded-lg font-semibold text-white transition"
                style={{ backgroundColor: '#2d5016' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a3009')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d5016')}
              >
                {editingId ? 'Update Event' : 'Add Event'}
              </button>
            </form>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold" style={{ color: '#2d5016' }}>
              Events ({events.length})
            </h2>
          </div>

          {events.length === 0 ? (
            <div className="px-8 py-12 text-center text-gray-500">
              <p>No events yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Event</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Venue</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ticket Link</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{event.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{event.event}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{event.time}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{event.venue}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{event.contact}</td>
                      <td className="px-6 py-4 text-sm">
                        {event.ticketLink ? (
                          <a
                            href={event.ticketLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mr-4"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
