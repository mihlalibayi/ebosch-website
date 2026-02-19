'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, deleteDoc, doc, addDoc, query, where, orderBy } from 'firebase/firestore';
import { Check, X } from 'lucide-react';

interface EventRequest {
  id: string;
  eventName: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: any;
}

export default function EventRequestsManagement() {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const q = query(
        collection(db, 'eventRequests'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as EventRequest));
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (req: EventRequest) => {
    try {
      // Create a new event in 'events' collection
      await addDoc(collection(db, 'events'), {
        event: req.eventName,
        date: req.date,
        startTime: req.time,
        endTime: req.time,
        time: req.time,
        eventType: 'in-person',
        venue: req.venue,
        contacts: [{ name: req.contactName, email: req.contactEmail, phone: req.contactPhone }],
        detailsConfirmed: false,
        clickToBuyLink: '',
        ticketLink: '',
        createdBy: 'visitor',
        images: [],
      });
      // Delete the request (or mark as approved)
      await deleteDoc(doc(db, 'eventRequests', req.id));
      loadRequests();
    } catch (error) {
      alert('Error approving request');
    }
  };

  const handleDecline = async (id: string) => {
    if (!confirm('Decline this request?')) return;
    try {
      await deleteDoc(doc(db, 'eventRequests', id));
      loadRequests();
    } catch (error) {
      alert('Error declining request');
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
        Event Requests
      </h1>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map(req => (
            <div key={req.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>{req.eventName}</h3>
                <span style={{ padding: '4px 8px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '999px', fontSize: '12px' }}>Pending</span>
              </div>
              <p><strong>Date:</strong> {req.date} at {req.time}</p>
              <p><strong>Venue:</strong> {req.venue}</p>
              <p><strong>Description:</strong> {req.description}</p>
              <p><strong>Contact:</strong> {req.contactName} – {req.contactEmail} {req.contactPhone && `/ ${req.contactPhone}`}</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  onClick={() => handleApprove(req)}
                  style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Check size={16} /> Approve
                </button>
                <button
                  onClick={() => handleDecline(req.id)}
                  style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <X size={16} /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}