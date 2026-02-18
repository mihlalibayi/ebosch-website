'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';

interface Membership {
  id: string;
  productName?: string;
  customerName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  businessName?: string;
  websiteUrl?: string;
  businessRegistration?: string;
  businessType?: string;
  title?: string;
  investorType?: string;
  annualFee?: number;
  price: number;
  status: 'active' | 'expired' | 'pending_payment' | 'paused' | 'cancelled';
  membershipType: 'individual' | 'business' | 'social_impact';
  expiryDate?: string;
  renewalDate?: string;
  createdAt: any;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  isMonthly?: boolean;
  heardFrom?: string;
  heardFromOther?: string;
  referredBy?: string;
  referredByOther?: string;
}

const TEAM_MEMBERS = ['Sias Mostert', 'Amanda Horne', 'William Horne', 'Other'];
const HEARD_FROM_OPTIONS = ['Email', "e'Bosch Event", 'Introduction by team member', 'Other'];

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '', address: '',
  businessName: '', websiteUrl: '', businessType: '', businessRegistration: '',
  investorType: 'individual' as 'individual' | 'business',
  title: 'Mr', membershipType: 'individual' as 'individual' | 'business' | 'social_impact',
  price: 100, annualFee: 5000, status: 'active' as Membership['status'],
  expiryDate: '', createdAt: new Date().toISOString().split('T')[0],
  heardFrom: '', heardFromOther: '', referredBy: '', referredByOther: '',
};

export default function MembershipsManagement() {
  const [activeTab, setActiveTab] = useState<'annual' | 'monthly'>('annual');
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Membership | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterReferrer, setFilterReferrer] = useState<string>('all');

  // Add / Edit member modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Membership | null>(null);
  const [addForm, setAddForm] = useState(emptyForm);

  useEffect(() => { loadMemberships(); }, [activeTab]);

  const loadMemberships = async () => {
    try {
      setLoading(true);
      let allMembers: Membership[] = [];

      if (activeTab === 'annual') {
        const annualSnap = await getDocs(collection(db, 'annual_memberships'));
        const annualData = annualSnap.docs.map(d => ({ id: d.id, ...d.data(), isMonthly: false, createdAt: d.data().createdAt?.toDate?.() || new Date() })) as Membership[];
        const socialSnap = await getDocs(collection(db, 'social_impact_members'));
        const socialData = socialSnap.docs.map(d => ({ id: d.id, ...d.data(), isMonthly: false, createdAt: d.data().createdAt?.toDate?.() || new Date() })) as Membership[];
        allMembers = [...annualData, ...socialData];
      } else {
        const monthlySnap = await getDocs(collection(db, 'monthly_memberships'));
        allMembers = monthlySnap.docs.map(d => ({ id: d.id, ...d.data(), isMonthly: true, createdAt: d.data().createdAt?.toDate?.() || new Date() })) as Membership[];
      }

      setMembers(allMembers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    } catch (error) {
      console.error('Error loading memberships:', error);
      setLoading(false);
    }
  };

  const getCollectionName = (member: Membership) => {
    if (activeTab === 'monthly') return 'monthly_memberships';
    return member.membershipType === 'social_impact' ? 'social_impact_members' : 'annual_memberships';
  };

  const updateStatus = async (memberId: string, newStatus: string) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;
      await updateDoc(doc(db, getCollectionName(member), memberId), { status: newStatus });
      loadMemberships();
    } catch (error) { alert('Error updating status'); }
  };

  const renewMembership = async (memberId: string) => {
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      await updateDoc(doc(db, getCollectionName(member), memberId), { status: 'active', expiryDate: expiryDate.toISOString(), renewalDate: new Date().toISOString() });
      loadMemberships();
      alert('Membership renewed successfully');
    } catch (error) { alert('Error renewing membership'); }
  };

  const markPaymentReceived = async (memberId: string) => {
    try {
      const nextPaymentDate = new Date();
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      await updateDoc(doc(db, 'monthly_memberships', memberId), { status: 'active', lastPaymentDate: new Date().toISOString(), nextPaymentDate: nextPaymentDate.toISOString() });
      loadMemberships();
      setShowPaymentModal(false);
      setSelectedMember(null);
      alert('Payment marked as received');
    } catch (error) { alert('Error marking payment'); }
  };

  const deleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member? This cannot be undone.')) return;
    try {
      const member = members.find(m => m.id === memberId);
      if (!member) return;
      await deleteDoc(doc(db, getCollectionName(member), memberId));
      loadMemberships();
    } catch (error) { alert('Error deleting member'); }
  };

  const openEditModal = (member: Membership) => {
    setEditingMember(member);
    setAddForm({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      businessName: member.businessName || '',
      websiteUrl: member.websiteUrl || '',
      businessType: member.businessType || '',
      businessRegistration: member.businessRegistration || '',
      investorType: (member.investorType as 'individual' | 'business') || 'individual',
      title: member.title || 'Mr',
      membershipType: member.membershipType,
      price: member.price || 100,
      annualFee: member.annualFee || 5000,
      status: member.status,
      expiryDate: member.expiryDate ? member.expiryDate.split('T')[0] : '',
      createdAt: member.createdAt ? new Date(member.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      heardFrom: member.heardFrom || '',
      heardFromOther: member.heardFromOther || '',
      referredBy: member.referredBy || '',
      referredByOther: member.referredByOther || '',
    });
    setShowAddModal(true);
  };

  const handleSaveMember = async () => {
    try {
      const data: any = {
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        email: addForm.email,
        phone: addForm.phone,
        address: addForm.address,
        businessName: addForm.businessName,
        websiteUrl: addForm.websiteUrl,
        businessType: addForm.businessType,
        businessRegistration: addForm.businessRegistration,
        investorType: addForm.investorType,
        title: addForm.title,
        membershipType: addForm.membershipType,
        price: Number(addForm.price),
        annualFee: Number(addForm.annualFee),
        status: addForm.status,
        expiryDate: addForm.expiryDate ? new Date(addForm.expiryDate).toISOString() : '',
        createdAt: addForm.createdAt ? new Date(addForm.createdAt) : new Date(),
        heardFrom: addForm.heardFrom,
        heardFromOther: addForm.heardFrom === 'Other' ? addForm.heardFromOther : '',
        referredBy: addForm.heardFrom === 'Introduction by team member' ? addForm.referredBy : '',
        referredByOther: addForm.heardFrom === 'Introduction by team member' && addForm.referredBy === 'Other' ? addForm.referredByOther : '',
      };

      const colName = activeTab === 'monthly' ? 'monthly_memberships'
        : addForm.membershipType === 'social_impact' ? 'social_impact_members' : 'annual_memberships';

      if (editingMember) {
        await updateDoc(doc(db, colName, editingMember.id), data);
        alert('Member updated successfully');
      } else {
        await addDoc(collection(db, colName), data);
        alert('Member added successfully');
      }

      setShowAddModal(false);
      setEditingMember(null);
      setAddForm(emptyForm);
      loadMemberships();
    } catch (error) {
      console.error(error);
      alert('Error saving member');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = { active: '#10b981', expired: '#ef4444', pending_payment: '#f59e0b', paused: '#8b5cf6', cancelled: '#6b7280' };
    return colors[status] || '#6b7280';
  };

  const isPaymentOverdue = (member: Membership) => {
    if (member.status === 'paused' || member.status === 'cancelled') return false;
    if (!member.createdAt) return false;
    const subscriptionDate = new Date(member.createdAt);
    const paymentDueDay = subscriptionDate.getDate();
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth(), paymentDueDay);
    if (dueDate > today) return false;
    if (member.lastPaymentDate) {
      const lastPayment = new Date(member.lastPaymentDate);
      if (lastPayment.getMonth() === today.getMonth() && lastPayment.getFullYear() === today.getFullYear()) return false;
    }
    return true;
  };

  const getMemberDetails = (member: Membership) => {
    const details: { label: string; value: string }[] = [];
    if (member.membershipType === 'individual') {
      details.push({ label: 'Name', value: `${member.firstName || ''} ${member.lastName || ''}`.trim() });
      details.push({ label: 'Email', value: member.email });
      if (member.phone) details.push({ label: 'Phone', value: member.phone });
      if (member.address) details.push({ label: 'Address', value: member.address });
    } else if (member.membershipType === 'business') {
      if (member.businessName) details.push({ label: 'Business Name', value: member.businessName });
      details.push({ label: 'Email', value: member.email });
      if (member.phone) details.push({ label: 'Phone', value: member.phone });
      if (member.websiteUrl) details.push({ label: 'Website', value: member.websiteUrl });
      if (member.businessRegistration) details.push({ label: 'Business Registration', value: member.businessRegistration });
    } else if (member.membershipType === 'social_impact') {
      if (member.investorType === 'individual') {
        if (member.title) details.push({ label: 'Title', value: member.title });
        details.push({ label: 'Name', value: `${member.firstName || ''} ${member.lastName || ''}`.trim() });
      } else {
        if (member.businessName) details.push({ label: 'Business Name', value: member.businessName });
        if (member.websiteUrl) details.push({ label: 'Website', value: member.websiteUrl });
      }
      details.push({ label: 'Email', value: member.email });
      if (member.phone) details.push({ label: 'Phone', value: member.phone });
      details.push({ label: activeTab === 'monthly' ? 'Monthly Fee' : 'Annual Fee', value: `R${member.annualFee || member.price}` });
    }

    if (member.heardFrom) details.push({ label: 'Heard From', value: member.heardFrom === 'Other' ? (member.heardFromOther || 'Other') : member.heardFrom });
    if (member.referredBy) details.push({ label: 'Referred By', value: member.referredBy === 'Other' ? (member.referredByOther || 'Other') : member.referredBy });

    return details;
  };

  // Apply filters
  const filteredMembers = members.filter(m => {
    if (filterType !== 'all' && m.membershipType !== filterType) return false;
    if (filterReferrer !== 'all') {
      if (filterReferrer === 'Other') {
        if (m.referredBy !== 'Other') return false;
      } else {
        if (m.referredBy !== filterReferrer) return false;
      }
    }
    return true;
  });

  const inputStyle = { padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', fontWeight: 'normal' as const, width: '100%', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: 'normal' as const };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'normal', color: '#111827', margin: '0 0 8px 0' }}>Memberships Management</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Manage annual and monthly memberships</p>
        </div>
        <button
          onClick={() => { setEditingMember(null); setAddForm(emptyForm); setShowAddModal(true); }}
          style={{ padding: '10px 20px', backgroundColor: '#2d5016', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'normal', cursor: 'pointer' }}
        >
          + Add Member
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
        {(['annual', 'monthly'] as const).map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setFilterType('all'); setFilterReferrer('all'); }}
            style={{ padding: '12px 24px', backgroundColor: activeTab === tab ? '#2d5016' : 'transparent', color: activeTab === tab ? 'white' : '#6b7280', border: 'none', borderBottom: activeTab === tab ? '3px solid #2d5016' : 'none', cursor: 'pointer', fontWeight: 'normal', fontSize: '15px', marginBottom: '-2px' }}>
            {tab === 'annual' ? '📅 Annual Memberships' : '🔄 Monthly Memberships'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ ...labelStyle, marginBottom: '6px' }}>Filter by Type</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer', minWidth: '180px' }}>
            <option value="all">All Types</option>
            <option value="individual">Individual</option>
            <option value="business">Business</option>
            <option value="social_impact">Social Impact</option>
          </select>
        </div>
        <div>
          <label style={{ ...labelStyle, marginBottom: '6px' }}>Filter by Referrer</label>
          <select value={filterReferrer} onChange={(e) => setFilterReferrer(e.target.value)}
            style={{ padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', cursor: 'pointer', minWidth: '200px' }}>
            <option value="all">All Referrers</option>
            <option value="Sias Mostert">Sias Mostert</option>
            <option value="Amanda Horne">Amanda Horne</option>
            <option value="William Horne">William Horne</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {(filterType !== 'all' || filterReferrer !== 'all') && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={() => { setFilterType('all'); setFilterReferrer('all'); }}
              style={{ padding: '8px 14px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
              Clear Filters
            </button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: 'auto' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Members List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #2d5016', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p>Loading memberships...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '60px 24px', textAlign: 'center', color: '#6b7280', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: '16px', margin: '0' }}>No members found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredMembers.map(member => (
            <div key={member.id} style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px', alignItems: 'center', backgroundColor: expandedMember === member.id ? '#f9fafb' : 'white', cursor: 'pointer' }}
                onClick={() => setExpandedMember(expandedMember === member.id ? null : member.id)}>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Member</p>
                  <p style={{ fontSize: '14px', fontWeight: 'normal', color: '#111827', margin: '0' }}>
                    {member.firstName && member.lastName ? `${member.firstName} ${member.lastName}` : member.businessName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Type</p>
                  <span style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: member.membershipType === 'individual' ? '#dbeafe' : member.membershipType === 'business' ? '#fef3c7' : '#f3e8ff', color: member.membershipType === 'individual' ? '#0369a1' : member.membershipType === 'business' ? '#92400e' : '#6b21a8', fontSize: '12px', fontWeight: 'normal', borderRadius: '4px' }}>
                    {member.membershipType === 'individual' ? 'Individual' : member.membershipType === 'business' ? 'Business' : 'Social Impact'}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Email</p>
                  <p style={{ fontSize: '12px', fontWeight: 'normal', color: '#111827', margin: '0', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.email}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Status</p>
                  <select value={member.status} onChange={(e) => { e.stopPropagation(); updateStatus(member.id, e.target.value); }}
                    style={{ padding: '6px 12px', backgroundColor: getStatusColor(member.status), color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'normal', cursor: 'pointer' }}>
                    {activeTab === 'annual' ? (
                      <><option value="active">Active</option><option value="expired">Expired</option><option value="pending_payment">Pending Payment</option></>
                    ) : (
                      <><option value="active">Active</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option></>
                    )}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {activeTab === 'monthly' && (
                    <div style={{ marginRight: '8px' }}>
                      {isPaymentOverdue(member) ? (
                        <span style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#fecaca', color: '#991b1b', fontSize: '12px', fontWeight: 'normal', borderRadius: '4px' }}>Overdue</span>
                      ) : (
                        <span style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 'normal', borderRadius: '4px' }}>Paid</span>
                      )}
                    </div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(member); }}
                    title="Edit member"
                    style={{ padding: '8px 10px', backgroundColor: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
                    ✏️
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); if (activeTab === 'annual') renewMembership(member.id); else { setSelectedMember(member); setShowPaymentModal(true); } }}
                    style={{ padding: '8px 16px', backgroundColor: activeTab === 'annual' ? '#10b981' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'normal', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
                    {activeTab === 'annual' ? '🔄 Renew' : '💰 Payment'}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteMember(member.id); }}
                    style={{ padding: '8px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
                    🗑️
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedMember === member.id && (
                <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'normal', color: '#111827', margin: '0 0 16px 0' }}>Member Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {getMemberDetails(member).map((detail, idx) => (
                      <div key={idx}>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: 'normal' }}>{detail.label}</p>
                        <p style={{ fontSize: '14px', color: '#111827', margin: '0', fontWeight: 'normal' }}>{detail.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: 'normal' }}>Join Date</p>
                      <p style={{ fontSize: '14px', color: '#111827', margin: '0', fontWeight: 'normal' }}>{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'}</p>
                    </div>
                    {activeTab === 'annual' && member.expiryDate && (
                      <div>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: 'normal' }}>Expiry Date</p>
                        <p style={{ fontSize: '14px', color: '#111827', margin: '0', fontWeight: 'normal' }}>{new Date(member.expiryDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {activeTab === 'monthly' && (
                      <>
                        <div>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: 'normal' }}>Monthly Payment Date</p>
                          <p style={{ fontSize: '14px', color: '#111827', margin: '0', fontWeight: 'normal' }}>{member.createdAt ? new Date(member.createdAt).getDate() : '-'} of each month</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: 'normal' }}>Last Payment</p>
                          <p style={{ fontSize: '14px', color: '#111827', margin: '0', fontWeight: 'normal' }}>{member.lastPaymentDate ? new Date(member.lastPaymentDate).toLocaleDateString() : 'Pending first payment'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', maxWidth: '700px', width: '100%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'normal', color: '#111827', marginTop: 0, marginBottom: '24px' }}>
              {editingMember ? 'Edit Member' : 'Add Member'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Membership Type *</label>
                <select value={addForm.membershipType} onChange={(e) => setAddForm({ ...addForm, membershipType: e.target.value as any })} style={inputStyle}>
                  <option value="individual">Individual</option>
                  <option value="business">Business</option>
                  <option value="social_impact">Social Impact</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status *</label>
                <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value as any })} style={inputStyle}>
                  {activeTab === 'annual' ? (
                    <><option value="active">Active</option><option value="expired">Expired</option><option value="pending_payment">Pending Payment</option></>
                  ) : (
                    <><option value="active">Active</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option></>
                  )}
                </select>
              </div>

              {(addForm.membershipType === 'individual' || (addForm.membershipType === 'social_impact' && addForm.investorType === 'individual')) && (
                <>
                  <div>
                    <label style={labelStyle}>Title</label>
                    <select value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} style={inputStyle}>
                      <option>Mr</option><option>Ms</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>First Name *</label>
                    <input type="text" value={addForm.firstName} onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name *</label>
                    <input type="text" value={addForm.lastName} onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })} style={inputStyle} />
                  </div>
                </>
              )}

              {addForm.membershipType === 'social_impact' && (
                <div>
                  <label style={labelStyle}>Investor Type</label>
                  <select value={addForm.investorType} onChange={(e) => setAddForm({ ...addForm, investorType: e.target.value as any })} style={inputStyle}>
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              )}

              {(addForm.membershipType === 'business' || (addForm.membershipType === 'social_impact' && addForm.investorType === 'business')) && (
                <>
                  <div>
                    <label style={labelStyle}>Business Name *</label>
                    <input type="text" value={addForm.businessName} onChange={(e) => setAddForm({ ...addForm, businessName: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Website URL</label>
                    <input type="url" value={addForm.websiteUrl} onChange={(e) => setAddForm({ ...addForm, websiteUrl: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Business Registration</label>
                    <input type="text" value={addForm.businessRegistration} onChange={(e) => setAddForm({ ...addForm, businessRegistration: e.target.value })} style={inputStyle} />
                  </div>
                </>
              )}

              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input type="tel" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{activeTab === 'monthly' ? 'Monthly Fee (R)' : 'Price (R)'}</label>
                <input type="number" value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: Number(e.target.value) })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Join Date</label>
                <input type="date" value={addForm.createdAt} onChange={(e) => setAddForm({ ...addForm, createdAt: e.target.value })} style={inputStyle} />
              </div>
              {activeTab === 'annual' && (
                <div>
                  <label style={labelStyle}>Expiry Date</label>
                  <input type="date" value={addForm.expiryDate} onChange={(e) => setAddForm({ ...addForm, expiryDate: e.target.value })} style={inputStyle} />
                </div>
              )}

              {/* How did you hear */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>How did they hear about e&apos;Bosch Membership?</label>
                <select value={addForm.heardFrom} onChange={(e) => setAddForm({ ...addForm, heardFrom: e.target.value, referredBy: '', referredByOther: '', heardFromOther: '' })} style={inputStyle}>
                  <option value="">Select an option</option>
                  {HEARD_FROM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {addForm.heardFrom === 'Other' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Please specify</label>
                  <input type="text" value={addForm.heardFromOther} onChange={(e) => setAddForm({ ...addForm, heardFromOther: e.target.value })} style={inputStyle} />
                </div>
              )}
              {addForm.heardFrom === 'Introduction by team member' && (
                <>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Referred by which team member?</label>
                    <select value={addForm.referredBy} onChange={(e) => setAddForm({ ...addForm, referredBy: e.target.value, referredByOther: '' })} style={inputStyle}>
                      <option value="">Select a team member</option>
                      {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  {addForm.referredBy === 'Other' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Please specify</label>
                      <input type="text" value={addForm.referredByOther} onChange={(e) => setAddForm({ ...addForm, referredByOther: e.target.value })} style={inputStyle} />
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => { setShowAddModal(false); setEditingMember(null); setAddForm(emptyForm); }}
                style={{ padding: '10px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: 'normal', cursor: 'pointer', fontSize: '14px' }}>
                Cancel
              </button>
              <button onClick={handleSaveMember}
                style={{ padding: '10px 24px', backgroundColor: '#2d5016', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'normal', cursor: 'pointer', fontSize: '14px' }}>
                {editingMember ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'normal', color: '#111827', marginBottom: '24px', marginTop: 0 }}>Mark Payment Received</h3>
            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #d1fae5' }}>
              <p style={{ fontSize: '14px', color: '#111827', margin: '0 0 8px 0', fontWeight: 'normal' }}>
                <strong>Member:</strong> {selectedMember.firstName && selectedMember.lastName ? `${selectedMember.firstName} ${selectedMember.lastName}` : selectedMember.businessName}
              </p>
              <p style={{ fontSize: '14px', color: '#111827', margin: 0, fontWeight: 'normal' }}><strong>Payment Date:</strong> {new Date().toLocaleDateString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowPaymentModal(false); setSelectedMember(null); }}
                style={{ padding: '10px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: 'normal', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => markPaymentReceived(selectedMember.id)}
                style={{ padding: '10px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'normal', cursor: 'pointer' }}>
                ✓ Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
