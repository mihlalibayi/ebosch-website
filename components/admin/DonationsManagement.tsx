'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

interface Donation {
  id: string;
  donatorType: 'individual' | 'business';
  donationMethod: 'no-tax' | 'section18a';
  title?: string;
  fullName?: string;
  businessName?: string;
  websiteUrl?: string;
  email: string;
  phone?: string;
  amount?: number;
  proofOfPaymentFileName?: string;
  createdAt: any;
  status: 'pending' | 'complete';
}

type SortBy = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc';

export default function DonationsManagement() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');
  const [filterMethod, setFilterMethod] = useState<'all' | 'no-tax' | 'section18a'>('all');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'business'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'complete'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadDonations(); }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'donations'));
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() || new Date()
      })) as Donation[];
      setDonations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading donations:', error);
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: Donation['status']) => {
    try {
      await updateDoc(doc(db, 'donations', id), { status: newStatus });
      loadDonations();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const deleteDonation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donation record? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'donations', id));
      loadDonations();
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      alert('Error deleting record');
    }
  };

  const getName = (d: Donation) => d.fullName || d.businessName || '—';

  const getStatusColor = (status: string) => {
    if (status === 'complete') return '#10b981';
    if (status === 'pending') return '#f59e0b';
    return '#6b7280';
  };

  const formatDate = (ts: any) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  };

  const getActionReminder = (d: Donation) => {
    if (d.status === 'complete') return null;
    if (d.donationMethod === 'no-tax') {
      return {
        text: "⚡ Action needed: Confirm payment received in e'Bosch account, then mark complete.",
        bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af',
      };
    }
    return {
      text: '⚡ Action needed: Verify proof of payment, then forward to Greater Stb Dev Trust (ref: eBosch) — they will issue the Section 18A certificate to the donor.',
      bg: '#fdf4ff', border: '#e9d5ff', color: '#6b21a8',
    };
  };

  const filtered = donations
    .filter(d => {
      if (filterMethod !== 'all' && d.donationMethod !== filterMethod) return false;
      if (filterType !== 'all' && d.donatorType !== filterType) return false;
      if (filterStatus !== 'all' && d.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return getName(d).toLowerCase().includes(q) || d.email.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return getName(a).localeCompare(getName(b));
      if (sortBy === 'name-desc') return getName(b).localeCompare(getName(a));
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      if (sortBy === 'date-asc') return aTime - bTime;
      return bTime - aTime;
    });

  const totalConfirmed = donations
    .filter(d => d.donationMethod === 'no-tax' && d.status === 'complete' && d.amount)
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const btnStyle = (active: boolean, color = '#2d5016') => ({
    padding: '8px 16px',
    backgroundColor: active ? color : '#f3f4f6',
    color: active ? 'white' : '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>Donations Management</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>View and manage all e'Bosch Heritage Project donations</p>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#1e40af', flex: 1 }}>
          <strong>💳 No Tax Exemption:</strong> Payment goes directly to e'Bosch. Confirm money received in e'Bosch account, then mark complete.
        </div>
        <div style={{ backgroundColor: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#6b21a8', flex: 1 }}>
          <strong>📋 Section 18A:</strong> Payment goes to Greater Stb Dev Trust (ref: eBosch). Verify proof of payment and forward to the Trust — they issue the Section 18A certificate to the donor.
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Donations', value: donations.length, color: '#2d5016', bg: '#f0fdf4' },
          { label: 'Pending Action', value: donations.filter(d => d.status === 'pending').length, color: '#92400e', bg: '#fef3c7' },
          { label: 'Complete', value: donations.filter(d => d.status === 'complete').length, color: '#065f46', bg: '#d1fae5' },
          { label: "Confirmed e'Bosch Total", value: `R${totalConfirmed.toLocaleString()}`, color: '#1e40af', bg: '#dbeafe' },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: stat.bg, borderRadius: '12px', padding: '20px 24px', border: `1px solid ${stat.color}22` }}>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 6px 0' }}>{stat.label}</p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: stat.color, margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Status filter buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {(['all', 'pending', 'complete'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={btnStyle(filterStatus === s, s === 'pending' ? '#f59e0b' : s === 'complete' ? '#10b981' : '#2d5016')}
            onMouseEnter={(e) => { if (filterStatus !== s) e.currentTarget.style.backgroundColor = '#e5e7eb'; }}
            onMouseLeave={(e) => { if (filterStatus !== s) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}>
            {s === 'all' ? `All (${donations.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${donations.filter(d => d.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Search + Sort + Method + Type */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="🔍 Search by name or email..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', width: '220px' }} />

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}>
          <option value="date-desc">📅 Date: Newest First</option>
          <option value="date-asc">📅 Date: Oldest First</option>
          <option value="name-asc">🔤 Name: A → Z</option>
          <option value="name-desc">🔤 Name: Z → A</option>
        </select>

        <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value as any)}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}>
          <option value="all">All Methods</option>
          <option value="no-tax">No Tax Exemption</option>
          <option value="section18a">Section 18A</option>
        </select>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer' }}>
          <option value="all">All Types</option>
          <option value="individual">Individual</option>
          <option value="business">Business</option>
        </select>

        {(searchQuery || filterMethod !== 'all' || filterType !== 'all') && (
          <button onClick={() => { setSearchQuery(''); setFilterMethod('all'); setFilterType('all'); }}
            style={{ padding: '8px 14px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
            ✕ Clear
          </button>
        )}

        <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: 'auto' }}>
          {filtered.length} of {donations.length} records
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #2d5016', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p>Loading donations...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          No donations found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((donation) => {
            const reminder = getActionReminder(donation);
            return (
              <div key={donation.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}>

                {/* Row */}
                <div onClick={() => setExpandedId(expandedId === donation.id ? null : donation.id)}
                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>

                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {donation.donatorType === 'individual' ? '👤' : '🏢'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getName(donation)}
                    </p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{donation.email}</p>
                  </div>

                  <span style={{
                    padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
                    backgroundColor: donation.donationMethod === 'section18a' ? '#ede9fe' : '#dbeafe',
                    color: donation.donationMethod === 'section18a' ? '#5b21b6' : '#1e40af',
                  }}>
                    {donation.donationMethod === 'section18a' ? 'Section 18A' : 'No Tax Exemption'}
                  </span>

                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#2d5016', margin: 0, minWidth: '80px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {donation.amount ? `R${donation.amount.toLocaleString()}` : '—'}
                  </p>

                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, minWidth: '100px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {formatDate(donation.createdAt)}
                  </p>

                  <span style={{
                    padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600',
                    backgroundColor: `${getStatusColor(donation.status)}20`,
                    color: getStatusColor(donation.status),
                    minWidth: '80px', textAlign: 'center',
                  }}>
                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                  </span>

                  <span style={{ fontSize: '12px', color: '#9ca3af', transition: 'transform 0.2s', transform: expandedId === donation.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>

                {/* Expanded Detail */}
                {expandedId === donation.id && (
                  <div style={{ borderTop: '1px solid #f3f4f6', padding: '20px', backgroundColor: '#fafafa' }}>

                    {/* Action reminder */}
                    {reminder && (
                      <div style={{ backgroundColor: reminder.bg, border: `1px solid ${reminder.border}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: reminder.color, fontWeight: '500' }}>
                        {reminder.text}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                      {[
                        { label: 'Donator Type', value: donation.donatorType === 'individual' ? 'Individual' : 'Business' },
                        { label: 'Title', value: donation.title || '—' },
                        { label: 'Phone', value: donation.phone || '—' },
                        { label: 'Website', value: donation.websiteUrl || '—' },
                        { label: 'Donation Method', value: donation.donationMethod === 'section18a' ? 'Section 18A' : 'No Tax Exemption' },
                        { label: 'Proof of Payment', value: donation.proofOfPaymentFileName || '—' },
                      ].map((row, i) => (
                        <div key={i}>
                          <p style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>{row.label}</p>
                          <p style={{ fontSize: '14px', color: '#111827', margin: 0, wordBreak: 'break-word' }}>{row.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Update Status:</span>
                      {(['pending', 'complete'] as Donation['status'][]).map(s => (
                        <button key={s} onClick={() => updateStatus(donation.id, s)}
                          style={{
                            padding: '6px 14px', borderRadius: '6px', border: '1px solid',
                            borderColor: donation.status === s ? getStatusColor(s) : '#e5e7eb',
                            backgroundColor: donation.status === s ? `${getStatusColor(s)}20` : 'white',
                            color: donation.status === s ? getStatusColor(s) : '#374151',
                            fontSize: '13px', fontWeight: donation.status === s ? '600' : 'normal',
                            cursor: 'pointer',
                          }}>
                          {s === 'complete' ? '✅ Mark Complete' : '⏳ Mark Pending'}
                        </button>
                      ))}
                      <button onClick={() => deleteDonation(donation.id)}
                        style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fff5f5', color: '#dc2626', fontSize: '13px', cursor: 'pointer' }}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
